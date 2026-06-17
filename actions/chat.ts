'use server'

import { auth } from '@/auth'
import { ConversationType, MessageType } from '@/generated/prisma/enums'

import { chatEvents } from '@/lib/events'
import { prisma } from '@/lib/prisma'

export async function createOrGetConversation(
  participantIds: string[],
  type: ConversationType,
) {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, message: 'ไม่พบข้อมูลผู้ใช้งาน' }
  }

  const allParticipantIds = [...new Set([...participantIds, session.user.id])]

  const existing = await prisma.conversation.findFirst({
    where: {
      type,
      members: {
        every: { userId: { in: allParticipantIds } },
      },
    },
  })

  if (existing) {
    return { success: true, data: existing }
  } else {
    const newConversation = await prisma.conversation.create({
      data: {
        type,
        members: {
          create: allParticipantIds.map((userId) => ({ userId })),
        },
      },
    })
    return { success: true, data: newConversation }
  }
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

  const member = await prisma.conversationMember.findUnique({
    where: {
      conversationId_userId: { conversationId, userId: session.user.id },
    },
  })

  if (!member) {
    return { success: false, message: 'ไม่พบสิทธิ์เข้าถึงห้องแชท' }
  } else {
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: session.user.id,
        content,
        type,
      },
    })

    chatEvents.emit(`message:${conversationId}`, message)

    return { success: true, data: message }
  }
}

export async function fetchMessages(conversationId: string, cursor?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    return { items: [], nextCursor: undefined }
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: 20,
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
  })

  return {
    items: messages.reverse(),
    nextCursor: messages.length === 20 ? messages[0]?.id : undefined,
  }
}
