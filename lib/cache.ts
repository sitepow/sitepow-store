import { REDIS_CACHE_TTL } from '@/constants/system'

import { redis } from './redis'

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T | null>,
  ttl: number = REDIS_CACHE_TTL,
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
