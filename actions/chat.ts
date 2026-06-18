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

export async function getConversation(type: ConversationType) {
  const session = await auth()
  const currentUserId = session?.user?.id

  if (!currentUserId) {
    return { success: false, message: 'ไม่พบผู้ใช้งาน' }
  }

  let conversation = await prisma.conversation.findFirst({
    where: {
      type,
      members: { some: { userId: currentUserId } },
    },
    include: { members: true },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        type,
        members: { create: [{ userId: currentUserId }] },
      },
      include: { members: true },
    })
  }

  return { success: true, data: conversation }
}

export async function getSupportConversations() {
  const session = await auth()
  const userId = session?.user?.id
  const userRole = session?.user?.role

  if (!userId || userRole !== UserRole.SUPPORT) {
    return { success: false, message: 'ไม่พบสิทธิ์เข้าถึง' }
  }

  const conversations = await prisma.conversation.findMany({
    where: { type: ConversationType.SUPPORT },
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
    const merchantMember = c.members.find((m) => m.userId !== userId)
    const merchant = merchantMember?.user

    return {
      id: c.id,
      merchantName: merchant?.name ?? merchant?.email ?? 'ไม่ทราบชื่อ',
      merchantId: merchant?.id ?? '',
      lastMessage: c.messages[0]?.content ?? null,
      lastMessageAt: c.lastMessageAt,
      unreadCount: me?.unreadCount ?? 0,
      isAiEnabled: merchant?.isAiEnabled ?? false,
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
    select: { isAiEnabled: true, role: true },
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

    if (
      userRole !== UserRole.SUPPORT &&
      userRole !== UserRole.BOT &&
      sender?.isAiEnabled
    ) {
      handleAiResponse(conversationId, cleanContent).catch(console.error)
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
  if (session?.user?.role !== UserRole.SUPPORT) {
    return { success: false, message: 'คุณไม่มีสิทธิ์เปลี่ยนข้อมูลนี้' }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isAiEnabled: enabled },
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
