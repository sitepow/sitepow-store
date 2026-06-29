import { invalidateCacheByPattern } from '@/lib/cache'

export const invalidateStorefrontProductCache = async (storeSlug: string) => {
  await Promise.all([
    invalidateCacheByPattern(`storefront:products:list:*${storeSlug}*`),
    invalidateCacheByPattern(`storefront:products:detail:${storeSlug}:*`),
  ])
}
