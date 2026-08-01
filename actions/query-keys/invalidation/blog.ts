import { queryKeyToRedisKey } from '@/utils/cache'

import { invalidateCacheByPattern } from '@/lib/cache'

import { blogKeys } from '../blog'

export const invalidateBlogCache = async (storeSlug?: string) => {
  const baseKey = queryKeyToRedisKey(blogKeys.all)

  if (storeSlug) {
    const storePattern = `${baseKey}:*${storeSlug}*`
    await invalidateCacheByPattern(storePattern)
  } else {
    const allPattern = `${baseKey}:*`
    await invalidateCacheByPattern(allPattern)
  }
}
