import { NextRequest } from 'next/server'

import { auth } from '@/auth'
import { ConversationType, UserRole } from '@/generated/prisma/enums'

import { chatEvents } from '@/lib/events'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params
  const session = await auth()
  const userId = session?.user?.id
  const userRole = session?.user?.role

  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const hasAccess = await checkAccess(conversationId, userId!, userRole)

  if (!hasAccess) {
    return new Response('Forbidden', { status: 403 })
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const unsubscribe = chatEvents.subscribe(
        `message:${conversationId}`,
        (msg) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(msg)}\n\n`))
        },
      )

      req.signal.addEventListener('abort', () => {
        unsubscribe()
        controller.close()
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

export async function checkAccess(
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
