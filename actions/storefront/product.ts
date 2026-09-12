'use server'

import { Prisma, StoreStatus } from '@/generated/prisma/client'
import { queryKeyToRedisKey } from '@/utils/cache'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'

import { storefrontProductKeys } from '../query-keys/storefront/product'

const storefrontProductListSelect = {
  id: true,
  title: true,
  slug: true,
  categoryId: true,
  productType: true,
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

const storefrontProductDetailSelect = {
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
      title: true,
      price: true,
      image: true,
      digitalUrl: true,
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

export type StorefrontProductListItem = DecimalToNumber<
  Prisma.ProductGetPayload<{ select: typeof storefrontProductListSelect }>
>

export type StorefrontProductDetail = DecimalToNumber<
  Prisma.ProductGetPayload<{ select: typeof storefrontProductDetailSelect }>
>

export interface GetStorefrontProductsParams {
  storeSlug: string
  page?: number
  limit?: number
  search?: string
  categorySlug?: string
}

export interface GetStorefrontProductsResponse {
  data: StorefrontProductListItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getStorefrontProducts({
  storeSlug,
  page = 1,
  limit = 12,
  search = '',
  categorySlug = '',
}: GetStorefrontProductsParams): Promise<GetStorefrontProductsResponse> {
  const cacheKey = queryKeyToRedisKey(
    storefrontProductKeys.list({
      storeSlug,
      page,
      limit,
      search,
      categorySlug,
    }),
  )

  const data = await withCache(cacheKey, async () => {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(50, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.ProductWhereInput = {
      isPublished: true,
      store: { slug: storeSlug, status: StoreStatus.ACTIVE },
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        {
          tags: { some: { name: { contains: search, mode: 'insensitive' } } },
        },
      ]
    }

    if (categorySlug) {
      whereClause.category = { slug: categorySlug }
    }

    const [totalItems, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: storefrontProductListSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(products),
      meta: {
        currentPage: sanitizedPage,
        limit: sanitizedLimit,
        totalItems,
        totalPages,
        hasNextPage: sanitizedPage < totalPages,
        hasPreviousPage: sanitizedPage > 1,
      },
    }
  })

  return (
    data ?? {
      data: [],
      meta: {
        currentPage: page,
        limit,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }
  )
}

export async function getStorefrontProductDetail(
  storeSlug: string,
  productSlug: string,
): Promise<StorefrontProductDetail | null> {
  const cacheKey = queryKeyToRedisKey(
    storefrontProductKeys.detail(storeSlug, productSlug),
  )

  const decodedSlug = decodeURIComponent(productSlug)

  const product = await withCache(cacheKey, async () => {
    const res = await prisma.product.findFirst({
      where: {
        OR: [{ slug: productSlug }, { slug: decodedSlug }, { id: productSlug }],
        isPublished: true,
        store: { slug: storeSlug, status: StoreStatus.ACTIVE },
      },
      select: storefrontProductDetailSelect,
    })

    return res ? serializeDecimal(res) : null
  })

  return product
}

export async function getRelatedProducts(
  productId: string,
  categoryId: string,
  limit: number = 6,
) {
  return serializeDecimal(
    await prisma.product.findMany({
      where: {
        categoryId: categoryId,
        isPublished: true,
        id: {
          not: productId,
        },
      },
      take: limit,
      include: {
        images: {
          where: { isPrimary: true },
          take: 1,
        },
        variants: {
          take: 1,
        },
      },
    }),
  )
}
