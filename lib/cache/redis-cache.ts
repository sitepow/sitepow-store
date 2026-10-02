import { redis } from '@/lib/redis'

function validateCachePattern(pattern: string): void {
  if (!pattern || typeof pattern !== 'string') {
    throw new Error('[Cache] Invalidation pattern must be a non-empty string')
  }

  const trimmed = pattern.trim()
  const dangerousPatterns = ['*', 'tenant:*', 'tenant:*:*', '*:*', '::*']
  if (dangerousPatterns.includes(trimmed)) {
    throw new Error(
      `[Cache] Dangerous pattern rejected: "${pattern}". Pattern is too broad and could wipe multiple tenants.`,
    )
  }

  const segments = trimmed.split(':').filter((s) => s.length > 0 && s !== '*')
  if (segments.length < 2) {
    throw new Error(
      `[Cache] Pattern "${pattern}" is too broad. At least 2 specific namespace segments are required.`,
    )
  }
}

export async function remember<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  try {
    const cached = await redis.get(key)
    if (cached !== null) {
      try {
        return JSON.parse(cached) as T
      } catch (parseErr) {
        console.warn(
          `[Cache] JSON parse error for key "${key}", falling back to fetcher:`,
          parseErr,
        )
        redis.del(key).catch(() => {})
      }
    }
  } catch (redisError) {
    console.warn(
      `[Cache] Redis GET failure for key "${key}" (falling back to DB):`,
      redisError,
    )
  }

  const freshData = await fetcher()

  if (freshData !== undefined) {
    try {
      await redis.setex(key, ttlSeconds, JSON.stringify(freshData))
    } catch (redisError) {
      console.warn(
        `[Cache] Redis SETEX failure for key "${key}":`,
        redisError,
      )
    }
  }

  return freshData
}

export async function getCache<T>(key: string): Promise<T | null> {
  try {
    const raw = await redis.get(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch (error) {
    console.warn(`[Cache] Redis GET error for key "${key}":`, error)
    return null
  }
}

export async function setCache<T>(
  key: string,
  value: T,
  ttlSeconds: number,
): Promise<void> {
  try {
    await redis.setex(key, ttlSeconds, JSON.stringify(value))
  } catch (error) {
    console.warn(`[Cache] Redis SETEX error for key "${key}":`, error)
  }
}

export async function invalidate(key: string): Promise<void> {
  if (!key) return

  try {
    await redis.unlink(key)
  } catch (error) {
    console.error(`[Cache] Failed to invalidate key "${key}":`, error)
  }
}

export async function invalidateMultiple(keys: string[]): Promise<void> {
  const validKeys = keys.filter(Boolean)
  if (validKeys.length === 0) return

  try {
    await redis.unlink(...validKeys)
  } catch (error) {
    console.error('[Cache] Failed to invalidate multiple keys:', error)
  }
}

export async function invalidateByPattern(pattern: string): Promise<number> {
  validateCachePattern(pattern)

  let deletedCount = 0
  const BATCH_SIZE = 200

  try {
    const stream = redis.scanStream({
      match: pattern,
      count: BATCH_SIZE,
    })

    let currentBatch: string[] = []

    for await (const keys of stream) {
      if (Array.isArray(keys) && keys.length > 0) {
        currentBatch.push(...keys)

        if (currentBatch.length >= BATCH_SIZE) {
          const pipeline = redis.pipeline()
          pipeline.unlink(...currentBatch)
          await pipeline.exec()
          deletedCount += currentBatch.length
          currentBatch = []
        }
      }
    }

    if (currentBatch.length > 0) {
      const pipeline = redis.pipeline()
      pipeline.unlink(...currentBatch)
      await pipeline.exec()
      deletedCount += currentBatch.length
    }

    return deletedCount
  } catch (error) {
    console.error(`[Cache] Failed to invalidate pattern "${pattern}":`, error)
    return deletedCount
  }
}

export async function invalidateMultiplePatterns(patterns: string[]): Promise<void> {
  await Promise.all(patterns.map((pattern) => invalidateByPattern(pattern)))
}
