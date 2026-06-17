'use server'

import { auth } from '@/auth'
import { BAD_WORD_LISTS } from '@/constants/badwords'
import { AI_BOT_ID } from '@/constants/system'
import {
  ConversationType,
  MessageType,
  UserRole,
} from '@/generated/prisma/enums'

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

async function canAccessConversation(
  conversationId: string,
  userId: string,
  userRole: UserRole,
) {
  if (userRole === UserRole.SUPPORT) {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { type: true },
    })
    return conversation?.type === ConversationType.SUPPORT
  }

  const member = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: { conversationId, userId },
    },
  })

  return !!member
}

export async function createOrGetConversation(
  participantIds: string[],
  type: ConversationType,
) {
  const session = await auth()
  const currentUserId = session?.user?.id
  if (!currentUserId) {
    return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
  }

  const allParticipantIds = [
    ...new Set([...participantIds, currentUserId]),
  ].filter((id): id is string => typeof id === 'string' && id.length > 0)

  const conversations = await prisma.conversation.findMany({
    where: {
      type,
      members: {
        every: { userId: { in: allParticipantIds } },
      },
    },
    include: { members: true },
  })

  const existing = conversations.find(
    (c) =>
      c.members.length === allParticipantIds.length &&
      allParticipantIds.every((id) => c.members.some((m) => m.userId === id)),
  )

  if (existing) {
    return { success: true, data: existing }
  }

  const newConversation = await prisma.conversation.create({
    data: {
      type,
      members: {
        create: allParticipantIds.map((userId) => ({ userId })),
      },
    },
    include: { members: true },
  })

  return { success: true, data: newConversation }
}

export async function fetchSupportConversations() {
  const session = await auth()
  if (!session?.user?.id || session.user.role !== UserRole.SUPPORT) {
    return { success: false, message: 'ไม่พบสิทธิ์เข้าถึง' }
  }

  const conversations = await prisma.conversation.findMany({
    where: { type: ConversationType.SUPPORT },
    orderBy: { lastMessageAt: 'desc' },
    include: {
      members: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  const merchantIds = conversations
    .map((c) => c.members[0]?.userId)
    .filter((id): id is string => !!id)

  const merchants = await prisma.user.findMany({
    where: { id: { in: merchantIds } },
    select: { id: true, name: true, email: true, isAiEnabled: true },
  })

  const merchantMap = new Map(merchants.map((m) => [m.id, m]))

  const items = conversations.map((c) => {
    const merchantId = c.members[0]?.userId
    const merchant = merchantId ? merchantMap.get(merchantId) : undefined

    const unreadCount =
      c.messages.filter(
        (m) =>
          m.senderId !== session.user.id && !m.readBy.includes(session.user.id),
      ).length || 0

    return {
      id: c.id,
      merchantName: merchant?.name ?? merchant?.email ?? 'ไม่ทราบชื่อร้าน',
      lastMessage: c.messages[0]?.content ?? null,
      lastMessageAt: c.lastMessageAt,
      merchantId: merchantId ?? '',
      isAiEnabled: merchant?.isAiEnabled ?? true,
      unreadCount,
    }
  })

  return { success: true, data: items }
}

export async function sendMessage(
  conversationId: string,
  content: string,
  type: MessageType = MessageType.TEXT,
) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
  }

  const sender = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isAiEnabled: true, role: true },
  })

  const hasAccess = await canAccessConversation(
    conversationId,
    session.user.id,
    session.user.role,
  )

  if (!hasAccess) {
    return { success: false, message: 'ไม่พบสิทธิ์เข้าถึงห้องแชท' }
  }

  const cleanContent =
    type === MessageType.TEXT ? cleanBadWords(content) : content

  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId: session.user.id,
      content: cleanContent,
      type,
      readBy: [session.user.id],
    },
    include: { sender: { select: { id: true, name: true, role: true } } },
  })

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageAt: message.createdAt },
  })

  chatEvents.publish(`message:${conversationId}`, message)

  if (
    session.user.role !== UserRole.SUPPORT &&
    session.user.role !== UserRole.BOT &&
    sender?.isAiEnabled
  ) {
    generateAiSupportAction(cleanContent)
      .then(async (aiResult) => {
        if (aiResult.success && aiResult.data) {
          const aiMessage = await prisma.message.create({
            data: {
              conversationId,
              senderId: AI_BOT_ID,
              content: aiResult.data,
              type: MessageType.TEXT,
            },
            include: {
              sender: { select: { id: true, role: true } },
            },
          })

          await prisma.conversation.update({
            where: { id: conversationId },
            data: { lastMessageAt: aiMessage.createdAt },
          })

          chatEvents.publish(`message:${conversationId}`, aiMessage)
        }
      })
      .catch(console.error)
  }

  return { success: true, data: message }
}

export async function fetchMessages(conversationId: string, cursor?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { items: [], nextCursor: undefined }
  }

  const hasAccess = await canAccessConversation(
    conversationId,
    session.user.id,
    session.user.role,
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

export async function getUnreadCount() {
  const session = await auth()
  const userId = session?.user?.id

  return await prisma.message.count({
    where: {
      conversation: { members: { some: { userId } } },
      senderId: { not: userId },
      NOT: { readBy: { has: userId } },
    },
  })
}
