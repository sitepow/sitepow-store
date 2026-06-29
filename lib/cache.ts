import { REDIS_CACHE_TTL_SECONDS } from '@/constants/system'

import { redis } from './redis'

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T | null>,
  ttl: number = REDIS_CACHE_TTL_SECONDS,
): Promise<T | null> {
  try {
    const cachedData = await redis.get(key)
    if (cachedData) {
      return JSON.parse(cachedData) as T
    }
  } catch (error) {
    console.error(error)
  }

  const freshData = await fetcher()

  if (freshData) {
    try {
      await redis.setex(key, ttl, JSON.stringify(freshData))
    } catch (error) {
      console.error(error)
    }
  }

  return freshData
}

export async function invalidateCacheByPattern(pattern: string | string[]) {
  if (!pattern || pattern === '*' || pattern === ':*') {
    throw new Error('Invalid cache pattern: pattern is too broad')
  }

  const matchPattern = Array.isArray(pattern) ? pattern.join(':') : pattern

  const stream = redis.scanStream({
    match: matchPattern,
    count: 100,
  })

  const pipeline = redis.pipeline()

  for await (const keys of stream) {
    if (keys.length > 0) {
      pipeline.del(...keys)
    }
  }

  await pipeline.exec()
}
