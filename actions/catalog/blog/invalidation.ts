import { queryKeyToRedisKey } from '@/utils/cache/query-key'

import { invalidateCacheByPattern } from '@/lib/cache'

import { blogKeys } from '@/actions/catalog/blog/query-keys'

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
