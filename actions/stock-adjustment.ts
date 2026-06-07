'use server'

import { Prisma, StockAdjustmentReason } from '@/generated/prisma/client'

import { prisma } from '@/lib/prisma'

interface GetStockAdjustmentsParams {
  storeId: string
  branchId?: string
  variantId?: string
  page?: number
  limit?: number
  search?: string
}

export interface CreateStockAdjustmentInput {
  storeId: string
  variantId: string
  branchId: string
  quantity: number
  reason: StockAdjustmentReason
  note?: string
}

const stockAdjustmentSelect = {
  id: true,
  quantity: true,
  reason: true,
  note: true,
  createdAt: true,
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
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
} satisfies Prisma.StockAdjustmentSelect

export type GetStockAdjustmentItem = Prisma.StockAdjustmentGetPayload<{
  select: typeof stockAdjustmentSelect
}>

export interface GetStockAdjustmentsResponse {
  data: GetStockAdjustmentItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getStockAdjustments({
  storeId,
  branchId,
  variantId,
  page = 1,
  limit = 10,
  search,
}: GetStockAdjustmentsParams): Promise<GetStockAdjustmentsResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.StockAdjustmentWhereInput = { storeId }

    if (branchId) {
      whereClause.branchId = branchId
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
      ]
    }

    const [totalItems, adjustments] = await Promise.all([
      prisma.stockAdjustment.count({ where: whereClause }),
      prisma.stockAdjustment.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: stockAdjustmentSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: adjustments,
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

export async function createStockAdjustment(input: CreateStockAdjustmentInput) {
  try {
    const { storeId, variantId, branchId, quantity, reason, note } = input

    if (quantity === 0) {
      return { success: false, message: 'จำนวนต้องไม่เป็น 0' }
    }

    const FREE_REASONS: StockAdjustmentReason[] = [
      StockAdjustmentReason.CORRECTION,
      StockAdjustmentReason.OTHER,
    ]

    if (!FREE_REASONS.includes(reason) && quantity > 0) {
      return { success: false, message: 'ไม่สามารถเพิ่มสต็อกด้วยเหตุผลนี้ได้' }
    }

    const stock = await prisma.productStock.findUnique({
      where: { branchId_variantId: { branchId, variantId } },
      select: { id: true, quantity: true },
    })

    if (!stock) {
      return { success: false, message: 'ไม่พบข้อมูลสต็อกสาขานี้' }
    }

    const newQuantity = stock.quantity + quantity

    if (newQuantity < 0) {
      return {
        success: false,
        message: `สต็อกไม่เพียงพอ (มีอยู่ ${stock.quantity} ชิ้น)`,
      }
    }

    const [, adjustment] = await prisma.$transaction([
      prisma.productStock.update({
        where: { id: stock.id },
        data: { quantity: newQuantity },
      }),
      prisma.stockAdjustment.create({
        data: { storeId, variantId, branchId, quantity, reason, note },
        select: stockAdjustmentSelect,
      }),
    ])

    return { success: true, message: 'ปรับสต็อกสำเร็จแล้ว', data: adjustment }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
