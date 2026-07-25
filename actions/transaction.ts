'use server'

import { Prisma } from '@/generated/prisma/client'
import { TransactionType } from '@/generated/prisma/enums'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/auth-guard'
import { prisma } from '@/lib/prisma'

interface GetTransactionsParams {
  storeId: string
  page?: number
  limit?: number
  type?: TransactionType
}

const transactionSelect = {
  id: true,
  amount: true,
  type: true,
  description: true,
  orderId: true,
  createdAt: true,
} satisfies Prisma.TransactionSelect

export type GetTransactionsItem = Prisma.TransactionGetPayload<{
  select: typeof transactionSelect
}>

export interface GetTransactionsResponse {
  data: DecimalToNumber<GetTransactionsItem[]>
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getTransactions({
  storeId,
  page = 1,
  limit = 10,
  type,
}: GetTransactionsParams): Promise<GetTransactionsResponse> {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
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

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewFinance',
    })

    if (!authCheck.isAuthorized) {
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

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.TransactionWhereInput = { storeId }

    if (type) {
      whereClause.type = type
    }

    const [totalItems, transactions] = await Promise.all([
      prisma.transaction.count({ where: whereClause }),
      prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: transactionSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: transactions.map((t) => serializeDecimal(t)),
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
