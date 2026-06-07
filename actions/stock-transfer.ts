'use server'

import { Prisma } from '@/generated/prisma/client'

import { prisma } from '@/lib/prisma'

interface GetStockTransfersParams {
  storeId: string
  branchId?: string
  variantId?: string
  page?: number
  limit?: number
  search?: string
}

export interface CreateStockTransferInput {
  storeId: string
  variantId: string
  fromBranchId: string
  toBranchId: string
  quantity: number
  note?: string
}

const stockTransferSelect = {
  id: true,
  quantity: true,
  note: true,
  createdAt: true,
  variant: {
    select: {
      id: true,
      title: true,
      sku: true,
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  },
  fromBranch: {
    select: {
      id: true,
      name: true,
    },
  },
  toBranch: {
    select: {
      id: true,
      name: true,
    },
  },
} satisfies Prisma.StockTransferSelect

export type GetStockTransferItem = Prisma.StockTransferGetPayload<{
  select: typeof stockTransferSelect
}>

export interface GetStockTransfersResponse {
  data: GetStockTransferItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getStockTransfers({
  storeId,
  branchId,
  variantId,
  page = 1,
  limit = 10,
  search,
}: GetStockTransfersParams): Promise<GetStockTransfersResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.StockTransferWhereInput = { storeId }

    if (branchId) {
      whereClause.OR = [{ fromBranchId: branchId }, { toBranchId: branchId }]
    }

    if (variantId) {
      whereClause.variantId = variantId
    }

    if (search) {
      whereClause.OR = [
        {
          variant: {
            product: { title: { contains: search, mode: 'insensitive' } },
          },
        },
        { variant: { title: { contains: search, mode: 'insensitive' } } },
        { variant: { sku: { contains: search, mode: 'insensitive' } } },
        { fromBranch: { name: { contains: search, mode: 'insensitive' } } },
        { toBranch: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [totalItems, transfers] = await Promise.all([
      prisma.stockTransfer.count({ where: whereClause }),
      prisma.stockTransfer.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: stockTransferSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: transfers,
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

export async function createStockTransfer(input: CreateStockTransferInput) {
  try {
    const { storeId, variantId, fromBranchId, toBranchId, quantity, note } =
      input

    if (fromBranchId === toBranchId) {
      return {
        success: false,
        message: 'สาขาต้นทางและปลายทางต้องไม่เป็นสาขาเดียวกัน',
      }
    }

    if (quantity <= 0) {
      return { success: false, message: 'จำนวนต้องมากกว่า 0' }
    }

    const fromStock = await prisma.productStock.findUnique({
      where: { branchId_variantId: { branchId: fromBranchId, variantId } },
      select: { id: true, quantity: true },
    })

    if (!fromStock) {
      return { success: false, message: 'ไม่พบข้อมูลสต็อกสาขาต้นทาง' }
    }

    if (fromStock.quantity < quantity) {
      return {
        success: false,
        message: `สต็อกสาขาต้นทางไม่เพียงพอ (มีอยู่ ${fromStock.quantity} ชิ้น)`,
      }
    }

    const [, , transfer] = await prisma.$transaction([
      prisma.productStock.update({
        where: { id: fromStock.id },
        data: { quantity: { decrement: quantity } },
      }),
      prisma.productStock.upsert({
        where: { branchId_variantId: { branchId: toBranchId, variantId } },
        update: { quantity: { increment: quantity } },
        create: { branchId: toBranchId, variantId, quantity },
      }),
      prisma.stockTransfer.create({
        data: { storeId, variantId, fromBranchId, toBranchId, quantity, note },
        select: stockTransferSelect,
      }),
    ])

    return { success: true, message: 'โอนย้ายสต็อกสำเร็จแล้ว', data: transfer }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
