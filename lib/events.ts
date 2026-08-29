import { Message } from '@/generated/prisma/client'
import Redis from 'ioredis'

import { redis } from './redis'

export type OrderEventPayload = {
  type: 'ORDER_CREATED' | 'ORDER_CANCELLED' | 'ORDER_UPDATED'
  orderId: string
}

export const chatEvents = {
  publish: <T = Message>(channel: string, message: T) => {
    redis.publish(channel, JSON.stringify(message))
  },

  subscribe: <T = Message>(
    channel: string,
    onMessage: (message: T) => void,
  ) => {
    const sub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

    sub.subscribe(channel)

    const handler = (ch: string, msg: string) => {
      if (ch === channel) {
        try {
          onMessage(JSON.parse(msg) as T)
        } catch (err) {
          console.error('Redis Message Parse Error:', err)
        }
      }
    }

    sub.on('message', handler)

    sub.on('error', (err) => console.error(err))

    return () => {
      sub.off('message', handler)
      sub.unsubscribe(channel)
      sub.quit()
    }
  },
}
