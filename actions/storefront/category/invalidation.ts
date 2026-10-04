import { queryKeyToRedisKey } from '@/utils/cache/query-key'

import { invalidateCacheByPattern } from '@/lib/cache'

import { storefrontSectionsKeys } from '@/actions/storefront/sections/query-keys'

export const invalidateStorefrontCategoryCache = async (storeSlug: string) => {
  await Promise.all([
    invalidateCacheByPattern(`storefront:categories:list:*${storeSlug}*`),
    invalidateCacheByPattern(`storefront:categories:options:${storeSlug}`),
    invalidateCacheByPattern(
      queryKeyToRedisKey(
        storefrontSectionsKeys.categoriesProductsSections(storeSlug),
      ),
    ),
  ])
}
