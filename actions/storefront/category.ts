'use server'

import { Prisma, StoreStatus } from '@/generated/prisma/client'
import { queryKeyToRedisKey } from '@/utils/cache'

import { withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'

import { storefrontCategoryKeys } from '../query-keys/storefront/category'

const storefrontCategoryListSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  image: true,
  _count: {
    select: {
      products: {
        where: { isPublished: true },
      },
    },
  },
} satisfies Prisma.CategorySelect

const storefrontCategoryOptionsSelect = {
  id: true,
  title: true,
  slug: true,
} satisfies Prisma.CategorySelect

export type StorefrontCategoryListItem = Prisma.CategoryGetPayload<{
  select: typeof storefrontCategoryListSelect
}>

export type StorefrontCategoryOption = Prisma.CategoryGetPayload<{
  select: typeof storefrontCategoryOptionsSelect
}>

export interface GetStorefrontCategoriesParams {
  storeSlug: string
  search?: string
}

export async function getStorefrontCategories({
  storeSlug,
  search = '',
}: GetStorefrontCategoriesParams): Promise<StorefrontCategoryListItem[]> {
  const cacheKey = queryKeyToRedisKey(
    storefrontCategoryKeys.list({ storeSlug, search }),
  )

  const data = await withCache(cacheKey, async () => {
    const whereClause: Prisma.CategoryWhereInput = {
      store: { slug: storeSlug, status: StoreStatus.ACTIVE },
      products: {
        some: {
          isPublished: true,
        },
      },
    }

    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' }
    }

    return await prisma.category.findMany({
      where: whereClause,
      select: storefrontCategoryListSelect,
      orderBy: { title: 'asc' },
    })
  })

  return data ?? []
}

export async function getStorefrontCategoryOptions(
  storeSlug: string,
): Promise<StorefrontCategoryOption[]> {
  const cacheKey = queryKeyToRedisKey(storefrontCategoryKeys.options(storeSlug))

  const data = await withCache(cacheKey, async () => {
    return await prisma.category.findMany({
      where: {
        store: { slug: storeSlug, status: StoreStatus.ACTIVE },
        products: {
          some: {
            isPublished: true,
          },
        },
      },
      select: storefrontCategoryOptionsSelect,
      orderBy: { title: 'asc' },
    })
  })

  return data ?? []
}
