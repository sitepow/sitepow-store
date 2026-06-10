'use server'

import { Prisma, StoreStatus } from '@/generated/prisma/client'

import { prisma } from '@/lib/prisma'

const storefrontCategoryListSelect = {
  id: true,
  title: true,
  slug: true,
  description: true,
  image: true,
  _count: {
    select: { products: true },
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
  search,
}: GetStorefrontCategoriesParams): Promise<StorefrontCategoryListItem[]> {
  try {
    const whereClause: Prisma.CategoryWhereInput = {
      store: { slug: storeSlug, status: StoreStatus.ACTIVE },
    }

    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' }
    }

    return await prisma.category.findMany({
      where: whereClause,
      select: storefrontCategoryListSelect,
      orderBy: { title: 'asc' },
    })
  } catch {
    return []
  }
}

export async function getStorefrontCategoryOptions(
  storeSlug: string,
): Promise<StorefrontCategoryOption[]> {
  try {
    return await prisma.category.findMany({
      where: {
        store: { slug: storeSlug, status: StoreStatus.ACTIVE },
        products: { some: {} },
      },
      select: storefrontCategoryOptionsSelect,
      orderBy: { title: 'asc' },
    })
  } catch {
    return []
  }
}
