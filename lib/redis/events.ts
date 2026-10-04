import { Message } from '@/generated/prisma/client'
import Redis from 'ioredis'

import { redis } from '@/lib/redis/client'

export type OrderEventPayload = {
  type: 'ORDER_CREATED' | 'ORDER_CANCELLED' | 'ORDER_UPDATED'
  orderId: string
}

export type ResellerEventType =
  | 'STOCK_ADDED'
  | 'STOCK_ACCEPTED'
  | 'STOCK_UPDATED'
  | 'PRICE_CHANGED'
  | 'AGREEMENT_UPDATED'

export type ResellerEventPayload = {
  type: ResellerEventType
  agreementId: string
  supplierStoreId: string
  resellerStoreId?: string
  variantId?: string
  updatedAt?: string
}

export const appEvents = {
  publish: <T = Message | OrderEventPayload | ResellerEventPayload>(
    channel: string,
    message: T,
  ) => {
    redis.publish(channel, JSON.stringify(message))
  },

  subscribe: <T = Message | OrderEventPayload | ResellerEventPayload>(
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
          console.error(`Redis Message Parse Error on channel [${ch}]:`, err)
        }
      }
    }

    sub.on('message', handler)
    sub.on('error', (err) => console.error('Redis Event Error:', err))

    return () => {
      sub.off('message', handler)
      sub.unsubscribe(channel)
      sub.quit()
    }
  },
}
