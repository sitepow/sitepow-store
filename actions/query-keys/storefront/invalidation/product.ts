import { revalidateTag } from 'next/cache'

import { invalidateCacheByPattern } from '@/lib/cache'

export const invalidateStorefrontProductCache = async (
  storeSlug: string,
  productSlug?: string,
) => {
  await Promise.all([
    invalidateCacheByPattern(`storefront:products:list:*${storeSlug}*`),
    invalidateCacheByPattern(`storefront:products:detail:${storeSlug}:*`),
  ])

  try {
    revalidateTag(`store:${storeSlug}`, 'max')
    revalidateTag(`products:${storeSlug}`, 'max')
    if (productSlug) {
      revalidateTag(`product:${storeSlug}:${productSlug}`, 'max')
    }
  } catch (error) {
    console.warn('revalidateTag skipped or failed:', error)
  }
}
