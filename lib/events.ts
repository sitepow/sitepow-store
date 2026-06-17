import { Message } from '@/generated/prisma/client'
import Redis from 'ioredis'

import { redis } from './redis'

const sub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

export const chatEvents = {
  publish: (channel: string, message: Message) => {
    redis.publish(channel, JSON.stringify(message))
  },

  subscribe: (channel: string, onMessage: (message: Message) => void) => {
    sub.subscribe(channel)

    const handler = (ch: string, msg: string) => {
      if (ch === channel) {
        onMessage(JSON.parse(msg))
      }
    }

    sub.on('message', handler)

    return () => {
      sub.off('message', handler)
      sub.unsubscribe(channel)
    }
  },
}
