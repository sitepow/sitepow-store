'use server'

import { auth } from '@/auth'
import { Prisma } from '@/generated/prisma/client'
import { serializeDecimal } from '@/utils/decimal'

import { prisma } from '@/lib/prisma'

const storeAiCreditSelect = {
  id: true,
  name: true,
  plan: true,
  aiVisionCredits: true,
  aiSearchCredits: true,
  usage: {
    select: {
      aiVisionUsed: true,
      aiSearchUsed: true,
      lastResetDate: true,
    },
  },
} satisfies Prisma.StoreSelect

export type StoreAiCreditItem = Prisma.StoreGetPayload<{
  select: typeof storeAiCreditSelect
}>

export async function getStoreAiCredits(ownerId: string, storeId?: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  try {
    return serializeDecimal(
      await prisma.store.findMany({
        where: {
          ownerId,
          ...(storeId && { id: storeId }),
        },
        select: storeAiCreditSelect,
        orderBy: { createdAt: 'desc' },
      }),
    )
  } catch {
    return []
  }
}

const aiLogSelect = {
  id: true,
  action: true,
  prompt: true,
  cost: true,
  createdAt: true,
  store: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.AiLogSelect

export interface GetAiLogsParams {
  ownerId: string
  storeId?: string
  page?: number
  limit?: number
}

export interface GetAiLogsResponse {
  data: Prisma.AiLogGetPayload<{ select: typeof aiLogSelect }>[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getAiLogs({
  ownerId,
  storeId,
  page = 1,
  limit = 10,
}: GetAiLogsParams): Promise<GetAiLogsResponse> {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('ไม่พบข้อมูลผู้ใช้งาน')
  }

  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const where: Prisma.AiLogWhereInput = {
      store: { ownerId },
      ...(storeId && { storeId }),
    }

    const [totalItems, data] = await Promise.all([
      prisma.aiLog.count({ where }),
      prisma.aiLog.findMany({
        where,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: aiLogSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data,
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
