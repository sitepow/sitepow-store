import Redis from 'ioredis'

const globalForRedis = global as unknown as { redis: Redis }

export const redis =
  globalForRedis.redis ||
  new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
    lazyConnect: true,
    retryStrategy: (times) => Math.min(times * 50, 2000),
    maxRetriesPerRequest: 3,
  })

redis.on('error', (err) => {
  console.warn('[Redis] Connection warning:', err.message)
})

if (process.env.NODE_ENV !== 'production') {
  globalForRedis.redis = redis
}
