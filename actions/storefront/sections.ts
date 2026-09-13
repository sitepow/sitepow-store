'use server'

import { Prisma } from '@/generated/prisma/client'
import { queryKeyToRedisKey } from '@/utils/cache'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'

import { storefrontSectionsKeys } from '../query-keys/storefront/sections'

const storefrontSectionProductSelect = {
  id: true,
  title: true,
  slug: true,
  categoryId: true,
  productType: true,
  translations: true,
  images: {
    where: { isPrimary: true },
    select: { url: true },
    take: 1,
  },
  variants: {
    select: {
      id: true,
      price: true,
      discountType: true,
      discountAmount: true,
      discountActive: true,
      translations: true,
    },
    take: 1,
  },
} satisfies Prisma.ProductSelect

export type SectionProductItem = DecimalToNumber<
  Prisma.ProductGetPayload<{
    select: typeof storefrontSectionProductSelect
  }>
>

export type StorefrontSection = {
  id: string
  title: string
  slug: string
  image: string | null
  translations?: any
  products: SectionProductItem[]
}

export async function getStorefrontCategoriesProductsSections(
  storeSlug: string,
): Promise<StorefrontSection[]> {
  const cacheKey = queryKeyToRedisKey(
    storefrontSectionsKeys.categoriesProductsSections(storeSlug),
  )

  const data = await withCache(cacheKey, async () => {
    const categories = await prisma.category.findMany({
      where: {
        store: { slug: storeSlug },
        products: {
          some: {
            isPublished: true,
          },
        },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        image: true,
        translations: true,
      },
      orderBy: { title: 'asc' },
    })

    if (categories.length === 0) {
      return []
    }

    const categoryIds = categories.map((c) => c.id)

    const allProducts = serializeDecimal(
      await prisma.product.findMany({
        where: {
          categoryId: { in: categoryIds },
          isPublished: true,
        },
        orderBy: { createdAt: 'desc' },
        select: storefrontSectionProductSelect,
      }),
    )

    return categories
      .map((cat) => ({
        ...cat,
        products: allProducts
          .filter((p) => p.categoryId === cat.id)
          .slice(0, 10),
      }))
      .filter((cat) => cat.products.length > 0)
  })

  return data ?? []
}
