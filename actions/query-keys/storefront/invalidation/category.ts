import { queryKeyToRedisKey } from '@/utils/cache'

import { invalidateCacheByPattern } from '@/lib/cache'

import { storefrontSectionsKeys } from '../sections'

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
