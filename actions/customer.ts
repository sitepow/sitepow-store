'use server'

import { Prisma } from '@/generated/prisma/client'

import { prisma } from '@/lib/prisma'

interface GetCustomersParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

const customerStoreSelect = {
  rewardPoints: true,
  totalSpent: true,
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      customerType: true,
      createdAt: true,
    },
  },
} satisfies Prisma.CustomerStoreSelect

export type GetCustomersItem = Prisma.CustomerStoreGetPayload<{
  select: typeof customerStoreSelect
}>

export interface GetCustomersResponse {
  data: GetCustomersItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getCustomers({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetCustomersParams): Promise<GetCustomersResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.CustomerStoreWhereInput = { storeId }

    if (search) {
      whereClause.customer = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    const [totalItems, customerStores] = await Promise.all([
      prisma.customerStore.count({ where: whereClause }),
      prisma.customerStore.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { customer: { createdAt: 'desc' } },
        select: customerStoreSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: customerStores,
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
