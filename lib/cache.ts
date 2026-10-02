import { REDIS_CACHE_TTL_SECONDS } from '@/constants/system'

import { invalidateByPattern as invalidatePatternCore, remember } from './cache/redis-cache'

export * from './cache'

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T | null>,
  ttl: number = REDIS_CACHE_TTL_SECONDS,
): Promise<T | null> {
  return remember(key, ttl, fetcher)
}

export async function invalidateCacheByPattern(pattern: string | string[]) {
  const matchPattern = Array.isArray(pattern) ? pattern.join(':') : pattern
  await invalidatePatternCore(matchPattern)
}
