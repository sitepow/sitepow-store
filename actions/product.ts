'use server'

import { Prisma } from '@/generated/prisma/client'

import { prisma } from '@/lib/prisma'

const productSelect = {
  id: true,
  title: true,
  slug: true,
  createdAt: true,
  category: {
    select: {
      id: true,
      title: true,
    },
  },
  images: {
    where: { isPrimary: true },
    select: {
      url: true,
    },
    take: 1,
  },
  variants: {
    select: {
      id: true,
      title: true,
      price: true,
      sku: true,
    },
  },
} satisfies Prisma.ProductSelect

export type GetProductsItem = Prisma.ProductGetPayload<{
  select: typeof productSelect
}>

export interface GetProductsParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
  categoryId?: string
}

export interface GetProductsResponse {
  data: GetProductsItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getProducts({
  storeId,
  page = 1,
  limit = 10,
  search,
  categoryId,
}: GetProductsParams): Promise<GetProductsResponse> {
  if (!storeId) {
    return {
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
  }

  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(50, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.ProductWhereInput = {
      storeId: storeId,
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (categoryId) {
      whereClause.categoryId = categoryId
    }

    const [totalItems, products] = await Promise.all([
      prisma.product.count({ where: whereClause }),
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: {
          createdAt: 'desc',
        },
        select: productSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: products,
      meta: {
        currentPage: sanitizedPage,
        limit: sanitizedLimit,
        totalItems,
        totalPages,
        hasNextPage: sanitizedPage < totalPages,
        hasPreviousPage: sanitizedPage > 1,
      },
    }
  } catch {
    return {
      data: [],
      meta: {
        currentPage: page,
        limit: limit,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }
  }
}
