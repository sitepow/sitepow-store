'use server'

import { Prisma } from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'
import { DecimalToNumber, serializeDecimal } from '@/utils/shared/decimal'

import { getCurrentUser } from '@/lib/auth/server'
import { verifyEmployeePermission } from '@/lib/auth/permission'
import { prisma } from '@/lib/db/prisma'

interface GetReviewsParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

const reviewSelect = {
  id: true,
  rating: true,
  comment: true,
  images: true,
  video: true,
  date: true,
  storeId: true,
  productId: true,
  variantId: true,
  product: {
    select: {
      id: true,
      title: true,
    },
  },
  customerId: true,
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
    },
  },
  orderId: true,
  selectedOptions: true,
  categories: {
    select: {
      id: true,
      label: true,
      rating: true,
    },
  },
} satisfies Prisma.ReviewSelect

export type GetReviewItem = Prisma.ReviewGetPayload<{
  select: typeof reviewSelect
}>

export interface GetReviewsResponse {
  data: DecimalToNumber<GetReviewItem[]>
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getReviews({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetReviewsParams): Promise<GetReviewsResponse> {
  const emptyResponse: GetReviewsResponse = {
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

  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return emptyResponse
  }

  try {
    const whereClause: Prisma.ReviewWhereInput = {}

    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canViewReviews',
      })

      if (!authCheck.isAuthorized) {
        return emptyResponse
      }

      whereClause.storeId = storeId
    } else {
      const userStores = await prisma.store.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { employeeStores: { some: { employee: { userId } } } },
          ],
        },
        select: { id: true },
      })

      const storeIds = userStores.map((s) => s.id)
      whereClause.storeId = { in: storeIds }
    }

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    if (search) {
      whereClause.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { product: { title: { contains: search, mode: 'insensitive' } } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [totalItems, reviews] = await Promise.all([
      prisma.review.count({ where: whereClause }),
      prisma.review.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { date: 'desc' },
        select: reviewSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(reviews),
      meta: {
        currentPage: sanitizedPage,
        limit: sanitizedLimit,
        totalItems,
        totalPages,
        hasNextPage: sanitizedPage < totalPages,
        hasPreviousPage: sanitizedPage > 1,
      },
    }
  } catch (error) {
    console.error(error)
    return emptyResponse
  }
}
