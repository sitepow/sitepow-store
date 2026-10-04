import { queryKeyToRedisKey } from '@/utils/cache/query-key'

import { invalidateCacheByPattern } from '@/lib/cache'

import { employeeKeys } from '@/actions/store/employee/query-keys'

export const invalidateEmployeePermissionCache = async (
  userId?: string,
  storeId?: string,
) => {
  if (!storeId) {
    return
  }

  const baseKey = queryKeyToRedisKey(employeeKeys.all)

  if (userId) {
    const userStorePattern = `${userId}:${baseKey}:store:${storeId}:*`
    await invalidateCacheByPattern(userStorePattern)
  } else {
    const storePattern = `*:${baseKey}:store:${storeId}:*`
    await invalidateCacheByPattern(storePattern)
  }
}
