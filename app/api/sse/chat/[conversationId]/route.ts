import { NextRequest } from 'next/server'

import { REDIS_CACHE_TTL_SECONDS } from '@/constants/system'
import { ConversationType, UserRole } from '@/generated/prisma/enums'

import { getCurrentUser } from '@/lib/auth-server'
import { withCache } from '@/lib/cache'
import { appEvents } from '@/lib/events'
import { prisma } from '@/lib/prisma'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> },
) {
  const { conversationId } = await params

  const userSession = await getCurrentUser()
  const userId = userSession?.id
  const userRole = userSession?.role as UserRole | undefined

  if (!userId) {
    return new Response('Unauthorized', { status: 401 })
  }

  const hasAccess = await checkAccessWithCache(conversationId, userId, userRole)

  if (!hasAccess) {
    return new Response('Forbidden', { status: 403 })
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()

      const unsubscribe = appEvents.subscribe(
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

export async function checkAccessWithCache(
  conversationId: string,
  userId: string,
  userRole?: UserRole,
) {
  const cacheKey = `chat:access:${userId}:${conversationId}`

  return await withCache(
    cacheKey,
    async () => {
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        include: {
          store: true,
          members: { where: { userId } },
        },
      })

      if (!conversation) {
        return false
      }

      const isMember = conversation.members.length > 0

      if (userRole === UserRole.SUPPORT) {
        return conversation.type === ConversationType.SUPPORT
      }

      if (userRole === UserRole.MERCHANT) {
        if (conversation.type === ConversationType.STORE) {
          return conversation.store?.ownerId === userId || isMember
        }
        if (conversation.type === ConversationType.SUPPORT) {
          return isMember
        }
      }

      return isMember
    },
    REDIS_CACHE_TTL_SECONDS,
  )
}
