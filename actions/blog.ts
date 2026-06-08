'use server'

import { Prisma } from '@/generated/prisma/client'

import { prisma } from '@/lib/prisma'

interface GetBlogsParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

const blogSelect = {
  id: true,
  title: true,
  slug: true,
  image: true,
  tags: true,
  createdAt: true,
} satisfies Prisma.BlogSelect

export type GetBlogsItem = Prisma.BlogGetPayload<{
  select: typeof blogSelect
}>

export interface GetBlogsResponse {
  data: GetBlogsItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getBlogs({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetBlogsParams): Promise<GetBlogsResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.BlogWhereInput = { storeId }

    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [totalItems, blogs] = await Promise.all([
      prisma.blog.count({ where: whereClause }),
      prisma.blog.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: blogSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: blogs,
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
        limit,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    }
  }
}
