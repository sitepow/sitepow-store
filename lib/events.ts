import { Message } from '@/generated/prisma/client'
import Redis from 'ioredis'

import { redis } from './redis'

export const chatEvents = {
  publish: (channel: string, message: Message) => {
    redis.publish(channel, JSON.stringify(message))
  },

  subscribe: (channel: string, onMessage: (message: Message) => void) => {
    const sub = new Redis(process.env.REDIS_URL || 'redis://localhost:6379')

    sub.subscribe(channel)

    const handler = (ch: string, msg: string) => {
      if (ch === channel) {
        onMessage(JSON.parse(msg))
      }
    }

    sub.on('message', handler)

    sub.on('error', (err) => console.error('Redis Sub Error:', err))

    return () => {
      sub.off('message', handler)
      sub.unsubscribe(channel)
      sub.quit()
    }
  },
}
