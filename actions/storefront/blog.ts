'use server'

import { Prisma, StoreStatus } from '@/generated/prisma/client'
import { queryKeyToRedisKey } from '@/utils/cache'

import { withCache } from '@/lib/cache'
import { prisma } from '@/lib/prisma'

import { blogKeys } from '../query-keys/blog'

const storefrontBlogListSelect = {
  id: true,
  title: true,
  slug: true,
  image: true,
  tags: true,
  createdAt: true,
} satisfies Prisma.BlogSelect

const storefrontBlogDetailSelect = {
  id: true,
  title: true,
  slug: true,
  image: true,
  tags: true,
  content: true,
  createdAt: true,
} satisfies Prisma.BlogSelect

export type StorefrontBlogListItem = Prisma.BlogGetPayload<{
  select: typeof storefrontBlogListSelect
}>

export type StorefrontBlogDetail = Prisma.BlogGetPayload<{
  select: typeof storefrontBlogDetailSelect
}>

export interface GetStorefrontBlogsParams {
  storeSlug: string
  page?: number
  limit?: number
  search?: string
}

export interface GetStorefrontBlogsResponse {
  data: StorefrontBlogListItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getStorefrontBlogs({
  storeSlug,
  page = 1,
  limit = 9,
  search = '',
}: GetStorefrontBlogsParams): Promise<GetStorefrontBlogsResponse> {
  const cacheKey = queryKeyToRedisKey(
    blogKeys.list({ storeId: storeSlug, page, limit, search }),
  )

  const result = await withCache(cacheKey, async () => {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(50, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.BlogWhereInput = {
      store: { slug: storeSlug, status: StoreStatus.ACTIVE },
    }

    if (search) {
      whereClause.title = { contains: search, mode: 'insensitive' }
    }

    const [totalItems, blogs] = await Promise.all([
      prisma.blog.count({ where: whereClause }),
      prisma.blog.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: storefrontBlogListSelect,
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
  })

  return (
    result ?? {
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

export async function getStorefrontBlogDetail(
  storeSlug: string,
  blogSlug: string,
): Promise<StorefrontBlogDetail | null> {
  const cacheKey = queryKeyToRedisKey(blogKeys.detail(storeSlug, blogSlug))

  return await withCache(cacheKey, async () => {
    return await prisma.blog.findFirst({
      where: {
        slug: blogSlug,
        store: { slug: storeSlug, status: StoreStatus.ACTIVE },
      },
      select: storefrontBlogDetailSelect,
    })
  })
}
