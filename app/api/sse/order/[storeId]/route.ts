import { NextRequest } from 'next/server'

import { getCurrentUser } from '@/lib/auth/server'
import { OrderEventPayload, appEvents } from '@/lib/redis/events'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ storeId: string }> },
) {
  const { storeId } = await params

  const userSession = await getCurrentUser()
  if (!userSession?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder()
      let isClosed = false

      controller.enqueue(encoder.encode(': connected\n\n'))

      const unsubscribe = appEvents.subscribe<OrderEventPayload>(
        `order:${storeId}`,
        (data) => {
          if (isClosed) {
            return
          }

          try {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`),
            )
          } catch (err) {
            console.error('SSE Enqueue Error:', err)
          }
        },
      )

      req.signal.addEventListener('abort', () => {
        isClosed = true
        unsubscribe()
        try {
          controller.close()
        } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
