'use server'

import { checkAccess } from '@/app/api/chat/stream/[conversationId]/route'
import { BAD_WORD_LISTS } from '@/constants/badwords'
import { AI_BOT_ID } from '@/constants/system'
import { Message } from '@/generated/prisma/client'
import {
  ConversationType,
  MessageType,
  UserRole,
} from '@/generated/prisma/enums'
import { queryKeyToRedisKey } from '@/utils/cache'

import { auth } from '@/lib/auth'
import { withCache } from '@/lib/cache'
import { chatEvents } from '@/lib/events'
import { prisma } from '@/lib/prisma'

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

  const store = await prisma.store.findFirst({
    where: { slug: storeSlug, ownerId: userId },
    select: { id: true },
  })

  if (!store) {
    return { success: false, message: 'ไม่พบร้านค้าหรือไม่มีสิทธิ์' }
  }

  const conversations = await prisma.conversation.findMany({
    where: {
      type: ConversationType.STORE,
      storeId: store.id,
    },
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

  let conversation = await prisma.conversation.findFirst({
    where: {
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
          create: [{ userId: userId }, { userId: store.ownerId }],
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

    await handleAiResponse(conversation.id, 'สวัสดีครับ').catch(console.error)
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
      isAiEnabled:
        c.type === ConversationType.STORE
          ? other?.isAiStoreEnabled
          : other?.isAiSupportEnabled,
      isAiStoreEnabled: other?.isAiStoreEnabled ?? false,
      isAiSupportEnabled: other?.isAiSupportEnabled ?? false,
      type: c.type,
      currentAiStatus:
        c.type === ConversationType.STORE
          ? other?.isAiStoreEnabled
          : other?.isAiSupportEnabled,
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

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { members: { include: { user: true } }, store: true },
  })

  const hasAccess = await checkAccess(conversationId, userId, userRole)
  if (!hasAccess) {
    throw new Error('ไม่พบสิทธิ์เข้าถึงห้องแชท')
  }

  const result = await prisma
    .$transaction(async (tx) => {
      const cleanContent =
        type === MessageType.TEXT ? cleanBadWords(content) : content

      const msg = await tx.message.create({
        data: { conversationId, senderId: userId, content: cleanContent, type },
        include: {
          sender: {
            select: { id: true, role: true },
          },
        },
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
    .catch((err) => {
      return { success: false, message: err.message || 'เกิดข้อผิดพลาด' }
    })

  if ('success' in result && result.success === false) {
    return result
  }

  const message = result as Message

  chatEvents.publish(`message:${conversationId}`, message)

  let targetUser: {
    isAiStoreEnabled?: boolean
    isAiSupportEnabled?: boolean
  } | null = null

  if (conversation?.type === ConversationType.STORE && conversation.storeId) {
    const store = await prisma.store.findUnique({
      where: { id: conversation.storeId },
      select: {
        owner: { select: { id: true, isAiStoreEnabled: true, role: true } },
      },
    })
    targetUser = store?.owner ?? null
  } else if (conversation?.type === ConversationType.SUPPORT) {
    targetUser = await prisma.user.findFirst({
      where: { role: UserRole.SUPPORT, isAiSupportEnabled: true },
      select: { id: true, isAiSupportEnabled: true },
    })
  }

  let shouldEnableAi = false
  if (conversation?.type === ConversationType.STORE) {
    shouldEnableAi = targetUser?.isAiStoreEnabled ?? false
  } else if (conversation?.type === ConversationType.SUPPORT) {
    shouldEnableAi = !!targetUser
  }

  if (shouldEnableAi && userRole !== UserRole.BOT) {
    handleAiResponse(conversationId, content).catch(console.error)
  }

  return { success: true, data: result }
}

async function handleAiResponse(conversationId: string, content: string) {
  await ensureBotUser()

  const recentMessages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 10,
  })

  const formattedHistory = recentMessages
    .reverse()
    .map((m) => `${m.senderId === AI_BOT_ID ? 'AI' : 'User'}: ${m.content}`)
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
      include: {
        sender: {
          select: { id: true, role: true },
        },
      },
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
  }
}

export async function getMessages(conversationId: string, cursor?: string) {
  const session = await auth()
  const userId = session?.user?.id
  const userRole = session?.user?.role

  if (!session?.user?.id) {
    return { items: [], nextCursor: undefined }
  }

  const hasAccess = await checkAccess(conversationId, userId!, userRole)

  if (!hasAccess) {
    return { items: [], nextCursor: undefined }
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    include: {
      sender: {
        select: {
          id: true,
          role: true,
        },
      },
    },
  })

  return {
    items: messages.reverse(),
    nextCursor: messages.length === 20 ? messages[0]?.id : undefined,
  }
}

export async function toggleUserAi(
  userId: string,
  enabled: boolean,
  fieldType: ConversationType,
) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'ไม่ได้รับอนุญาต' }
  }

  const fieldName =
    fieldType === ConversationType.STORE
      ? 'isAiStoreEnabled'
      : 'isAiSupportEnabled'

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { [fieldName]: enabled },
    })

    return { success: true, message: 'ปรับการตั้งค่าสำเร็จ' }
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
