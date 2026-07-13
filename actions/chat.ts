'use server'

import { checkAccessWithCache } from '@/app/api/chat/stream/[conversationId]/route'
import { PLAN_DETAILS } from '@/config/planDetails'
import { GEMINI_MODEL } from '@/constants/ai'
import { BAD_WORD_LISTS } from '@/constants/badwords'
import {
  AI_BOT_ID,
  LATEST_MESSAGES_CACHE_TTL_SECONDS,
} from '@/constants/system'
import { Message } from '@/generated/prisma/client'
import {
  ActorType,
  ConversationType,
  LogAction,
  MessageType,
  Plan,
  TransactionType,
  UserRole,
} from '@/generated/prisma/enums'
import { calculateAiCost } from '@/utils/ai'
import { queryKeyToRedisKey } from '@/utils/cache'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { invalidateCacheByPattern, withCache } from '@/lib/cache'
import { chatEvents } from '@/lib/events'
import { prisma } from '@/lib/prisma'
import { redis } from '@/lib/redis'

import { generateAiSupportAction } from './ai-support'
import { chatKeys } from './query-keys/chat'

const sortedBadWords = [...BAD_WORD_LISTS].sort((a, b) => b.length - a.length)

function cleanBadWords(content: string): string {
  let cleanContent = content

  sortedBadWords.forEach((word) => {
    const regex = new RegExp(word, 'gi')
    cleanContent = cleanContent.replace(regex, '*'.repeat(word.length))
  })

  return cleanContent
}

export async function getMerchantConversations(storeSlug: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, message: 'ไม่พบผู้ใช้งาน' }
  }

  const cacheKey = `merchant:convs:${userId}:${storeSlug}`

  return await withCache(cacheKey, async () => {
    const store = await prisma.store.findFirst({
      where: { slug: storeSlug, ownerId: userId },
      select: { id: true },
    })
    if (!store)
      return { success: false, message: 'ไม่พบร้านค้าหรือไม่มีสิทธิ์' }

    const conversations = await prisma.conversation.findMany({
      where: { type: ConversationType.STORE, storeId: store.id },
      orderBy: { lastMessageAt: 'desc' },
      include: {
        members: {
          include: { user: true },
          where: { userId: { not: userId } },
        },
        messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })
    return { success: true, data: conversations }
  })
}

export async function getOrCreateStoreConversation(storeId: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId || !storeId) {
    return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งานหรือร้านค้า' }
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { ownerId: true },
  })

  if (!store) {
    return { success: false, message: 'ไม่พบร้านค้า' }
  }

  if (store.ownerId === userId) {
    return {
      success: false,
      message: 'เจ้าของร้านไม่สามารถแชทกับร้านตัวเองได้',
    }
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      type: ConversationType.STORE,
      storeId,
      members: {
        every: { userId: { in: [userId, store.ownerId] } },
      },
    },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        type: ConversationType.STORE,
        storeId,
        members: {
          create: [{ userId }, { userId: store.ownerId }],
        },
      },
    })
  }

  return { success: true, data: conversation }
}

export async function getConversation(
  type: ConversationType,
  storeId?: string,
) {
  const session = await auth()
  const currentUserId = session?.user?.id

  if (!currentUserId) {
    return { success: false, message: 'ไม่พบผู้ใช้งาน' }
  }

  if (type === ConversationType.STORE && !storeId) {
    return { success: false, message: 'ไม่พบข้อมูลร้านค้า' }
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      type,
      storeId: type === ConversationType.STORE ? storeId : undefined,
      members: { some: { userId: currentUserId } },
    },
    include: { members: true },
  })

  if (!conversation) {
    let extraMemberIds: string[] = []

    if (type === ConversationType.STORE) {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { ownerId: true },
      })

      if (!store) {
        return { success: false, message: 'ไม่พบร้านค้า' }
      }

      if (store.ownerId === currentUserId) {
        return {
          success: false,
          message: 'เจ้าของร้านไม่สามารถแชทกับร้านตัวเองได้',
        }
      }

      extraMemberIds = [store.ownerId]
    }

    conversation = await prisma.conversation.create({
      data: {
        type,
        storeId: type === ConversationType.STORE ? storeId : undefined,
        members: {
          create: [
            { userId: currentUserId },
            ...extraMemberIds.map((id) => ({ userId: id })),
          ],
        },
      },
      include: { members: true },
    })
  }

  return { success: true, data: conversation }
}

export async function getCustomerConversations() {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, message: 'ไม่พบสิทธิ์เข้าถึง' }
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      members: { some: { userId } },
    },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      store: { select: { name: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      members: { include: { user: true } },
    },
  })

  const data = conversations.map((c) => {
    const me = c.members.find((m) => m.userId === userId)

    return {
      id: c.id,
      name: c.type === ConversationType.STORE ? c.store?.name : 'Support Team',
      lastMessage: c.messages[0]?.content ?? null,
      lastMessageAt: c.lastMessageAt,
      unreadCount: me?.unreadCount ?? 0,
      type: c.type,
    }
  })

  return { success: true, data }
}

export async function getSupportConversations(storeId?: string) {
  const session = await auth()
  const userId = session?.user?.id
  const userRole = session?.user?.role

  if (!userId) {
    return { success: false, message: 'ไม่พบสิทธิ์เข้าถึง' }
  }

  if (userRole !== UserRole.SUPPORT && userRole !== UserRole.MERCHANT) {
    return { success: false, message: 'ไม่พบสิทธิ์เข้าถึง' }
  }

  if (userRole === UserRole.MERCHANT) {
    if (!storeId) {
      return { success: false, message: 'ไม่พบข้อมูลร้านค้า' }
    }

    const store = await prisma.store.findFirst({
      where: { id: storeId, ownerId: userId },
      select: { id: true },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบสิทธิ์เข้าถึงร้านค้านี้' }
    }
  }

  const conversations = await prisma.conversation.findMany({
    where:
      userRole === UserRole.SUPPORT
        ? { type: ConversationType.SUPPORT }
        : {
            type: ConversationType.STORE,
            storeId: storeId,
          },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      members: { include: { user: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  const data = conversations.map((c) => {
    const me = c.members.find((m) => m.userId === userId)
    const otherMember = c.members.find((m) => m.userId !== userId)
    const other = otherMember?.user

    return {
      id: c.id,
      merchantName: other?.name ?? other?.email ?? 'ไม่ทราบชื่อ',
      merchantId: other?.id ?? '',
      lastMessage: c.messages[0]?.content ?? null,
      lastMessageAt: c.lastMessageAt,
      unreadCount: me?.unreadCount ?? 0,
      isAiEnabled: c.isAiEnabled,
      type: c.type,
    }
  })

  return { success: true, data }
}

export async function sendMessage(
  conversationId: string,
  content: string,
  type: MessageType = MessageType.TEXT,
) {
  const session = await auth()
  const userId = session?.user?.id
  const userRole = session?.user?.role

  if (!userId) {
    return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
  }

  const members = await prisma.conversationMember.findMany({
    where: { conversationId },
    select: { userId: true },
  })

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { store: { select: { ownerId: true } } },
  })

  const hasAccess = await checkAccessWithCache(conversationId, userId, userRole)
  if (!hasAccess) {
    return { success: false, message: 'ไม่พบสิทธิ์เข้าถึงห้องแชท' }
  }

  const result = await prisma
    .$transaction(async (tx) => {
      const cleanContent =
        type === MessageType.TEXT ? cleanBadWords(content) : content
      const msg = await tx.message.create({
        data: { conversationId, senderId: userId, content: cleanContent, type },
        include: { sender: { select: { id: true, role: true } } },
      })
      await tx.conversation.update({
        where: { id: conversationId },
        data: { lastMessageAt: msg.createdAt },
      })
      await tx.conversationMember.updateMany({
        where: { conversationId, userId: { not: userId } },
        data: { unreadCount: { increment: 1 } },
      })
      return msg
    })
    .catch(() => {
      return {
        success: false,
      }
    })

  if ('success' in result && result.success === false) {
    return result
  }

  const newMessage = result as Message

  chatEvents.publish(`message:${conversationId}`, newMessage)

  const invalidateTasks: Promise<unknown>[] = [
    appendMessageToLatestCache(conversationId, newMessage),
  ]

  members.forEach((m) => {
    invalidateTasks.push(
      invalidateCacheByPattern(`merchant:convs:${m.userId}:*`),
    )
  })

  await Promise.all(invalidateTasks)

  const isSenderTheAnsweringParty =
    conversation?.type === ConversationType.STORE
      ? conversation.store?.ownerId === userId
      : conversation?.type === ConversationType.SUPPORT
        ? userRole === UserRole.SUPPORT
        : false

  if (
    conversation?.isAiEnabled &&
    userRole !== UserRole.BOT &&
    !isSenderTheAnsweringParty
  ) {
    const billingStoreId =
      conversation.type === ConversationType.STORE ? conversation.storeId : null

    handleAiResponse(conversationId, content, billingStoreId).catch(
      console.error,
    )
  }

  return { success: true, data: result }
}

async function appendMessageToLatestCache(
  conversationId: string,
  message: Message,
) {
  const cacheKey = `chat:messages:${conversationId}:latest`

  try {
    const cachedRaw = await redis.get(cacheKey)
    if (!cachedRaw) return

    const cached = JSON.parse(cachedRaw) as {
      items: Message[]
      nextCursor?: string
    }

    const updatedItems = [...cached.items, message].slice(-20)

    await redis.setex(
      cacheKey,
      LATEST_MESSAGES_CACHE_TTL_SECONDS,
      JSON.stringify({ items: updatedItems, nextCursor: cached.nextCursor }),
    )
  } catch (error) {
    console.error(error)
    await redis.del(cacheKey).catch(() => {})
  }
}

async function hasAiCredit(storeId: string) {
  const store = await prisma.store.findUnique({
    where: { id: storeId },
    select: { balance: true },
  })
  return Number(store?.balance ?? 0) > 0
}

async function chargeAiUsage({
  storeId,
  conversationId,
  cost,
  inputTokens,
  outputTokens,
}: {
  storeId: string
  conversationId: string
  cost: number
  inputTokens: number
  outputTokens: number
}) {
  try {
    await prisma.$transaction([
      prisma.store.update({
        where: { id: storeId },
        data: { balance: { decrement: cost } },
      }),
      prisma.transaction.create({
        data: {
          storeId,
          amount: cost,
          type: TransactionType.AI_USAGE,
          description: `AI ตอบแชทลูกค้า (conversationId: ${conversationId}, tokens: ${inputTokens}+${outputTokens})`,
        },
      }),
    ])

    createLog({
      action: LogAction.ADJUST_CREDITS,
      actorType: ActorType.SYSTEM,
      storeId,
      entity: 'Store',
      entityId: storeId,
      details: {
        reason: 'AI_CHAT_REPLY',
        conversationId,
        cost,
        inputTokens,
        outputTokens,
      },
    }).catch(console.error)
  } catch (error) {
    console.error(error)
  }
}

async function handleAiResponse(
  conversationId: string,
  content: string,
  storeId: string | null,
) {
  await ensureBotUser()

  if (storeId) {
    const canUseAi = await hasAiCredit(storeId)
    if (!canUseAi) {
      return
    }
  }

  const cacheKey = `chat:messages:${conversationId}:latest`
  const cachedData = await redis.get(cacheKey)

  let recentMessages: Message[] = []

  if (cachedData) {
    const allMessages = JSON.parse(cachedData).items
    recentMessages = allMessages.slice(-10)
  } else {
    recentMessages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
  }

  const formattedHistory = recentMessages
    .reverse()
    .map(
      (m) =>
        `${m.senderId === AI_BOT_ID ? UserRole.BOT : UserRole.CUSTOMER}: ${m.content}`,
    )
    .join('\n')

  const aiResult = await generateAiSupportAction(content, formattedHistory)

  if (aiResult.success && aiResult.data) {
    const aiMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: AI_BOT_ID,
        content: aiResult.data,
        type: MessageType.AI_ASSISTANT,
      },
      include: { sender: { select: { id: true, role: true } } },
    })
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: aiMessage.createdAt },
    })
    await prisma.conversationMember.updateMany({
      where: { conversationId, userId: { not: AI_BOT_ID } },
      data: { unreadCount: { increment: 1 } },
    })
    chatEvents.publish(`message:${conversationId}`, aiMessage)
    await appendMessageToLatestCache(conversationId, aiMessage)

    if (storeId && aiResult.usage) {
      const store = await prisma.store.findFirst({
        where: {
          id: storeId,
        },
        select: {
          plan: true,
        },
      })

      const cost = calculateAiCost(
        GEMINI_MODEL,
        aiResult.usage.inputTokens,
        aiResult.usage.outputTokens,
        PLAN_DETAILS[store?.plan || Plan.FREE].aiUsageMultiplier,
      )

      await chargeAiUsage({
        storeId,
        conversationId,
        cost,
        inputTokens: aiResult.usage.inputTokens,
        outputTokens: aiResult.usage.outputTokens,
      })
    }
  }
}

export async function getMessages(conversationId: string, cursor?: string) {
  if (cursor) {
    return await fetchMessagesFromDb(conversationId, cursor)
  }

  const cacheKey = `chat:messages:${conversationId}:latest`

  const result = await withCache(
    cacheKey,
    async () => {
      return await fetchMessagesFromDb(conversationId, cursor)
    },
    LATEST_MESSAGES_CACHE_TTL_SECONDS,
  )

  return result ?? { items: [], nextCursor: undefined }
}

async function fetchMessagesFromDb(conversationId: string, cursor?: string) {
  const session = await auth()
  const userId = session?.user?.id
  const userRole = session?.user?.role

  if (!session?.user?.id) {
    return { items: [], nextCursor: undefined }
  }

  const hasAccess = await checkAccessWithCache(
    conversationId,
    userId!,
    userRole,
  )
  if (!hasAccess) {
    return { items: [], nextCursor: undefined }
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    include: { sender: { select: { id: true, role: true } } },
  })

  return {
    items: messages.reverse(),
    nextCursor: messages.length === 20 ? messages[0]?.id : undefined,
  }
}

export async function toggleConversationAi(
  conversationId: string,
  enabled: boolean,
) {
  const session = await auth()
  const userId = session?.user?.id
  const userRole = session?.user?.role

  if (!userId) {
    return { success: false, message: 'ไม่ได้รับอนุญาต' }
  }

  const hasAccess = await checkAccessWithCache(conversationId, userId, userRole)
  if (!hasAccess) {
    return { success: false, message: 'ไม่พบสิทธิ์เข้าถึงห้องแชท' }
  }

  try {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { isAiEnabled: enabled },
    })
    return { success: true, message: 'ปรับการตั้งค่า AI สำเร็จ' }
  } catch {
    return { success: false }
  }
}

export async function markAsRead(conversationId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return
  }

  await prisma.conversationMember.updateMany({
    where: {
      conversationId: conversationId,
      userId: session.user.id,
    },
    data: {
      unreadCount: 0,
      lastReadAt: new Date(),
    },
  })
}

export async function getUnreadCount() {
  const session = await auth()

  if (!session?.user?.id) {
    return 0
  }

  const result = await prisma.conversationMember.aggregate({
    where: { userId: session.user.id },
    _sum: { unreadCount: true },
  })
  return result._sum.unreadCount || 0
}

export async function ensureBotUser() {
  const key = queryKeyToRedisKey(chatKeys.bot())

  return await withCache(key, async () => {
    const botUser = await prisma.user.findUnique({
      where: { id: AI_BOT_ID },
    })

    if (!botUser) {
      return await prisma.user.create({
        data: {
          id: AI_BOT_ID,
          name: 'AI Assistant',
          role: UserRole.BOT,
          email: 'ai-assistant@sitepow.store',
        },
      })
    }
    return botUser
  })
}
