'use server'

import { checkAccess } from '@/app/api/chat/stream/[conversationId]/route'
import { BAD_WORD_LISTS } from '@/constants/badwords'
import { AI_BOT_ID } from '@/constants/system'
import {
  ConversationType,
  MessageType,
  UserRole,
} from '@/generated/prisma/enums'

import { auth } from '@/lib/auth'
import { chatEvents } from '@/lib/events'
import { prisma } from '@/lib/prisma'

import { generateAiSupportAction } from './ai-support'

const sortedBadWords = [...BAD_WORD_LISTS].sort((a, b) => b.length - a.length)

function cleanBadWords(content: string): string {
  let cleanContent = content

  sortedBadWords.forEach((word) => {
    const regex = new RegExp(word, 'gi')
    cleanContent = cleanContent.replace(regex, '*'.repeat(word.length))
  })

  return cleanContent
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
    conversation = await prisma.conversation.create({
      data: {
        type,
        storeId: type === ConversationType.STORE ? storeId : undefined,
        members: { create: [{ userId: currentUserId }] },
      },
      include: { members: true },
    })

    await handleAiResponse(conversation.id, 'สวัสดีครับ').catch(console.error)
  }

  return { success: true, data: conversation }
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
        : { type: ConversationType.STORE, storeId },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      members: { include: { user: true } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  })

  for (const c of conversations) {
    const isMember = c.members.some((m) => m.userId === userId)

    if (!isMember) {
      await prisma.conversationMember
        .create({
          data: { conversationId: c.id, userId: userId },
        })
        .catch(() => {})
    }
  }

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
      isAiSupportEnabled: other?.isAiSupportEnabled ?? false,
      isAiStoreEnabled: other?.isAiStoreEnabled ?? false,
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

  const sender = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAiStoreEnabled: true, isAiSupportEnabled: true, role: true },
  })

  const conversation = await prisma.conversation.findFirst({
    where: { id: conversationId },
    select: {
      type: true,
    },
  })

  return await prisma.$transaction(async (tx) => {
    const hasAccess = await checkAccess(conversationId, userId, userRole)
    if (!hasAccess) {
      return { success: false, message: 'ไม่พบสิทธิ์เข้าถึงห้องแชท' }
    }

    const cleanContent =
      type === MessageType.TEXT ? cleanBadWords(content) : content

    const message = await tx.message.create({
      data: { conversationId, senderId: userId, content: cleanContent, type },
      include: {
        sender: {
          select: { id: true, role: true },
        },
      },
    })

    await tx.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: message.createdAt },
    })

    await tx.conversationMember.updateMany({
      where: { conversationId, userId: { not: userId } },
      data: { unreadCount: { increment: 1 } },
    })

    chatEvents.publish(`message:${conversationId}`, message)

    const isAiEnabled =
      conversation?.type === ConversationType.STORE
        ? sender?.isAiStoreEnabled
        : sender?.isAiSupportEnabled

    if (
      userRole !== UserRole.SUPPORT &&
      userRole !== UserRole.BOT &&
      isAiEnabled
    ) {
      await handleAiResponse(conversationId, cleanContent).catch(console.error)
    }

    return { success: true, data: message }
  })
}

async function handleAiResponse(conversationId: string, content: string) {
  const aiResult = await generateAiSupportAction(content)

  if (aiResult.success && aiResult.data) {
    const aiMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: AI_BOT_ID,
        content: aiResult.data,
        type: MessageType.TEXT,
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

export async function toggleUserAi(userId: string, enabled: boolean) {
  const session = await auth()
  const userRole = session?.user?.role

  const isCanEdit =
    userRole === UserRole.SUPPORT || userRole === UserRole.MERCHANT

  if (!isCanEdit) {
    return { success: false, message: 'คุณไม่มีสิทธิ์เปลี่ยนข้อมูลนี้' }
  }

  const updateData = {
    [userRole === UserRole.SUPPORT ? 'isAiSupportEnabled' : 'isAiStoreEnabled']:
      enabled,
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return { success: true, message: 'ปรับการตั้งค่าสำเร็จแล้ว' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function markAsRead(conversationId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return
  }

  await prisma.conversationMember.update({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
    data: { unreadCount: 0, lastReadAt: new Date() },
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
