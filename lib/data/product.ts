import { cache } from 'react'
import { unstable_cache } from 'next/cache'

import { Prisma, StoreStatus } from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { prisma } from '@/lib/prisma'

export const storefrontProductDetailSelect = {
  id: true,
  title: true,
  slug: true,
  productType: true,
  details: true,
  tags: { select: { name: true } },
  category: {
    select: { id: true, title: true, slug: true },
  },
  images: {
    select: { id: true, url: true, isPrimary: true },
  },
  variants: {
    select: {
      id: true,
      sku: true,
      title: true,
      price: true,
      image: true,
      isAvailable: true,
      discountActive: true,
      discountType: true,
      discountAmount: true,
      pointsActive: true,
      pointsAmount: true,
      weight: true,
      width: true,
      height: true,
      length: true,
      stocks: {
        select: {
          quantity: true,
          branchId: true,
          branch: { select: { name: true } },
        },
      },
      digitalItems: {
        select: {
          id: true,
          isUsed: true,
        },
      },
    },
  },
  options: {
    select: {
      id: true,
      title: true,
      maxSelect: true,
      require: true,
      choices: {
        select: { id: true, name: true, extraPrice: true },
      },
    },
  },
  addons: {
    where: { isAvailable: true },
    select: { id: true, title: true, price: true, isAvailable: true },
  },
  reviews: {
    select: {
      id: true,
      rating: true,
      comment: true,
      images: true,
      video: true,
      date: true,
      selectedOptions: true,
      categories: {
        select: { id: true, label: true, rating: true },
      },
      variant: {
        select: { title: true, sku: true },
      },
      customer: {
        select: { firstName: true, lastName: true, avatar: true },
      },
    },
    orderBy: { date: 'desc' },
    take: 10,
  },
} satisfies Prisma.ProductSelect

export type StorefrontProductDetail = DecimalToNumber<
  Prisma.ProductGetPayload<{ select: typeof storefrontProductDetailSelect }>
>

const getCachedProductDetail = (domain: string, slug: string) =>
  unstable_cache(
    async () => {
      if (!domain || !slug) return null

      const res = await prisma.product.findFirst({
        where: {
          slug,
          isPublished: true,
          store: { slug: domain, status: StoreStatus.ACTIVE },
        },
        select: storefrontProductDetailSelect,
      })

      return res ? serializeDecimal(res) : null
    },
    ['storefront-product-detail', domain, slug],
    {
      revalidate: 60,
      tags: [
        'products',
        `store:${domain}`,
        `product:${domain}:${slug}`,
        `products:${domain}`,
      ],
    },
  )()

export const getProductBySlug = cache(
  async (
    domain: string,
    slug: string,
  ): Promise<StorefrontProductDetail | null> => {
    if (!domain || !slug) return null
    return await getCachedProductDetail(domain, slug)
  },
)
