'use server'

import { Prisma } from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { prisma } from '@/lib/prisma'

interface GetInventoryParams {
  storeId: string
  branchId?: string
  page?: number
  limit?: number
  search?: string
}

const inventorySelect = {
  id: true,
  quantity: true,
  minStock: true,
  updatedAt: true,
  branch: {
    select: {
      id: true,
      name: true,
      isMain: true,
    },
  },
  variant: {
    select: {
      id: true,
      title: true,
      sku: true,
      price: true,
      product: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  },
} satisfies Prisma.ProductStockSelect

export type GetInventoryItem = Prisma.ProductStockGetPayload<{
  select: typeof inventorySelect
}>

export interface GetInventoryResponse {
  data: DecimalToNumber<GetInventoryItem[]>
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface UpdateStockInput {
  minStock: number
}

export interface UpsertStockInput {
  variantId: string
  branchId: string
  quantity: number
  minStock?: number
}

export async function getInventory({
  storeId,
  branchId,
  page = 1,
  limit = 10,
  search,
}: GetInventoryParams): Promise<GetInventoryResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.ProductStockWhereInput = {
      branch: { storeId },
    }

    if (branchId) {
      whereClause.branchId = branchId
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
      ]
    }

    const [totalItems, stocks] = await Promise.all([
      prisma.productStock.count({ where: whereClause }),
      prisma.productStock.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: [{ branch: { isMain: 'desc' } }, { updatedAt: 'desc' }],
        select: inventorySelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(stocks),
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

export async function updateStock(id: string, input: UpdateStockInput) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Stock ID' }
    }

    const updatedStock = await prisma.productStock.update({
      where: { id },
      data: input,
      select: inventorySelect,
    })

    return {
      success: true,
      message: 'อัปเดตสต็อกสำเร็จ',
      data: serializeDecimal(updatedStock),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function upsertStock(input: UpsertStockInput) {
  try {
    const { variantId, branchId, quantity, minStock = 0 } = input

    const stock = await prisma.productStock.upsert({
      where: { branchId_variantId: { branchId, variantId } },
      update: { quantity, minStock },
      create: { variantId, branchId, quantity, minStock },
      select: inventorySelect,
    })

    return {
      success: true,
      message: 'บันทึกสต็อกสำเร็จ',
      data: serializeDecimal(stock),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
