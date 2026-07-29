import { queryKeyToRedisKey } from '@/utils/cache'

import { invalidateCacheByPattern } from '@/lib/cache'

import { employeeKeys } from '../employee'

export const invalidateStorePermissionCache = async (
  storeId: string,
  userId?: string,
) => {
  if (!storeId) {
    return
  }

  if (userId) {
    const userStorePattern = `*${userId}*${queryKeyToRedisKey(employeeKeys.all)}:store:${storeId}:*`
    await invalidateCacheByPattern(userStorePattern)
  } else {
    const storePattern = `*${queryKeyToRedisKey(employeeKeys.all)}:store:${storeId}:*`
    await invalidateCacheByPattern(storePattern)
  }
}
