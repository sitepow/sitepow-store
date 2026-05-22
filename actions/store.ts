'use server'

import { Prisma } from '@/generated/prisma/client'
import { Plan, StoreStatus } from '@/generated/prisma/enums'

import { prisma } from '@/lib/prisma'

interface GetStoresParams {
  page?: number
  limit?: number
  search?: string
  status?: StoreStatus
  plan?: Plan
}

const storeDropdownSelect = {
  id: true,
  name: true,
} satisfies Prisma.StoreSelect

const storeSelect = {
  id: true,
  name: true,
  slug: true,
  plan: true,
  status: true,
  logo: true,
  createdAt: true,
} satisfies Prisma.StoreSelect

export type GetStoresItem = Prisma.StoreGetPayload<{
  select: typeof storeSelect
}>

export type GetStoreOptionsItem = Prisma.StoreGetPayload<{
  select: typeof storeDropdownSelect
}>

export interface GetStoresResponse {
  data: GetStoresItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getStore({ domain }: { domain: string }) {
  if (!domain) {
    return null
  }

  return await prisma.store.findUnique({
    where: {
      slug: domain,
    },
    select: {
      id: true,
      name: true,
      description: true,
      logo: true,
      status: true,
    },
  })
}

export async function getStores({
  page = 1,
  limit = 10,
  search,
  status,
  plan,
}: GetStoresParams = {}): Promise<GetStoresResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.StoreWhereInput = {}

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ]
    }

    if (status) {
      whereClause.status = status
    }

    if (plan) {
      whereClause.plan = plan
    }

    const [totalItems, stores] = await Promise.all([
      prisma.store.count({ where: whereClause }),
      prisma.store.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: {
          createdAt: 'desc',
        },
        select: storeSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: stores,
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

export async function getStoreOptions(filters?: {
  search?: string
  status?: StoreStatus
}): Promise<GetStoreOptionsItem[]> {
  try {
    const whereClause: Prisma.StoreWhereInput = {}

    if (filters?.search) {
      whereClause.name = { contains: filters.search, mode: 'insensitive' }
    }

    if (filters?.status) {
      whereClause.status = filters.status
    }

    return await prisma.store.findMany({
      where: whereClause,
      select: storeDropdownSelect,
      orderBy: {
        name: 'asc',
      },
    })
  } catch {
    return []
  }
}
