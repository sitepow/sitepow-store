'use server'

import { Prisma } from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { prisma } from '@/lib/prisma'

const storefrontSectionProductSelect = {
  id: true,
  title: true,
  slug: true,
  categoryId: true,
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
    },
    take: 1,
  },
} satisfies Prisma.ProductSelect

export type SectionProductItem = DecimalToNumber<
  Prisma.ProductGetPayload<{
    select: typeof storefrontSectionProductSelect
  }>
>

export async function getStorefrontCategoriesProductsSections(
  storeSlug: string,
) {
  try {
    const categories = await prisma.category.findMany({
      where: { store: { slug: storeSlug } },
      select: { id: true, title: true, slug: true, image: true },
      orderBy: { title: 'asc' },
    })

    const categoryIds = categories.map((c) => c.id)

    const allProducts = serializeDecimal(
      await prisma.product.findMany({
        where: { categoryId: { in: categoryIds } },
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: storefrontSectionProductSelect,
      }),
    )

    const groupedData = categories.map((cat) => ({
      ...cat,
      products: allProducts.filter((p) => p.categoryId === cat.id),
    }))

    return groupedData
  } catch (error) {
    console.error(error)
    return []
  }
}
