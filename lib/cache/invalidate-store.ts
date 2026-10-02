import { revalidateTag } from 'next/cache'

import { CacheKeys } from './keys'
import { invalidate, invalidateByPattern, invalidateMultiplePatterns } from './redis-cache'

function safeRevalidateTag(tag: string): void {
  try {
    revalidateTag(tag, 'max')
  } catch (error) {
    console.warn(`[Cache] Next.js revalidateTag skipped for tag "${tag}":`, error)
  }
}

export async function invalidateProduct(
  storeId: string,
  options?: {
    productId?: string
    slug?: string
    storeSlug?: string
  },
): Promise<void> {
  if (!storeId) {
    console.error('[Cache] invalidateProduct called without storeId')
    return
  }

  const tasks: Promise<unknown>[] = []

  tasks.push(invalidateByPattern(CacheKeys.product.lists(storeId).pattern))

  tasks.push(invalidateByPattern(`tenant:${storeId}:pos:branch:*:products:*`))

  if (options?.productId) {
    tasks.push(invalidate(CacheKeys.product.detail(storeId, options.productId).key))
  }
  if (options?.slug) {
    tasks.push(invalidate(CacheKeys.product.detail(storeId, options.slug).key))
  }

  if (options?.storeSlug) {
    tasks.push(
      invalidateMultiplePatterns([
        `storefront:tenant:${options.storeSlug}:products:list:*`,
        `storefront:products:list:*${options.storeSlug}*`, 
      ]),
    )
    if (options.slug) {
      tasks.push(
        invalidate(CacheKeys.storefront.productDetail(options.storeSlug, options.slug).key),
      )
    }
  }

  await Promise.all(tasks)

  safeRevalidateTag(`store-${storeId}-products`)
  safeRevalidateTag(`store-${storeId}`)
  if (options?.storeSlug) {
    safeRevalidateTag(`products:${options.storeSlug}`)
    safeRevalidateTag(`store:${options.storeSlug}`)
    if (options.slug) {
      safeRevalidateTag(`product:${options.storeSlug}:${options.slug}`)
    }
  }
}

export async function invalidateInventoryStock(
  storeId: string,
  branchId: string,
  options?: {
    variantId?: string
    productId?: string
  },
): Promise<void> {
  if (!storeId || !branchId) {
    console.error('[Cache] invalidateInventoryStock requires storeId and branchId')
    return
  }

  const tasks: Promise<unknown>[] = []

  tasks.push(invalidateByPattern(CacheKeys.inventory.lists(storeId).pattern))

  tasks.push(invalidateByPattern(CacheKeys.inventory.byBranch(storeId, branchId).pattern))

  tasks.push(invalidateByPattern(`tenant:${storeId}:pos:branch:${branchId}:products:*`))

  if (options?.variantId) {
    tasks.push(invalidate(CacheKeys.inventory.item(storeId, branchId, options.variantId).key))
  }

  if (options?.productId) {
    tasks.push(invalidate(CacheKeys.product.detail(storeId, options.productId).key))
  }

  await Promise.all(tasks)

  safeRevalidateTag(`store-${storeId}-inventory`)
  safeRevalidateTag(`store-${storeId}-branch-${branchId}-inventory`)
  if (options?.productId) {
    safeRevalidateTag(`store-${storeId}-product-${options.productId}`)
  }
}

export async function invalidateOrder(
  storeId: string,
  options?: {
    orderId?: string
    branchId?: string
  },
): Promise<void> {
  if (!storeId) return

  const tasks: Promise<unknown>[] = []

  tasks.push(invalidateByPattern(`tenant:${storeId}:orders:list:*`))

  if (options?.branchId) {
    tasks.push(invalidateByPattern(CacheKeys.pos.orders(storeId, options.branchId).pattern))
  }

  if (options?.orderId) {
    tasks.push(invalidate(CacheKeys.orders.detail(storeId, options.orderId).key))
  }

  await Promise.all(tasks)

  safeRevalidateTag(`store-${storeId}-orders`)
}

export async function invalidateStoreProfile(
  storeId: string,
  options?: {
    storeSlug?: string
    domain?: string
  },
): Promise<void> {
  if (!storeId) return

  const tasks: Promise<unknown>[] = [
    invalidate(CacheKeys.store.profile(storeId).key),
    invalidate(CacheKeys.store.settings(storeId).key),
  ]

  if (options?.storeSlug) {
    tasks.push(invalidate(CacheKeys.store.profile(options.storeSlug).key))
  }
  if (options?.domain) {
    tasks.push(invalidate(CacheKeys.store.profile(options.domain).key))
  }

  await Promise.all(tasks)

  safeRevalidateTag(`store-${storeId}-profile`)
  if (options?.storeSlug) {
    safeRevalidateTag(`store:${options.storeSlug}`)
  }
}
