'use server'

import {
  ActorType,
  DiscountType,
  LogAction,
  Prisma,
} from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
import { prisma } from '@/lib/prisma'

interface GetCouponsParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

export interface CreateCouponInput {
  storeId: string
  branchId?: string | null
  code: string
  description?: string | null
  discountType: DiscountType
  discountAmount: number | string
  minOrderAmount?: number | string
  maxDiscount?: number | string | null
  startDate: Date | string
  endDate: Date | string
  usageLimit?: number | null
}

export type UpdateCouponInput = Partial<Omit<CreateCouponInput, 'storeId'>>

const couponSelect = {
  id: true,
  code: true,
  description: true,
  discountType: true,
  discountAmount: true,
  minOrderAmount: true,
  maxDiscount: true,
  startDate: true,
  endDate: true,
  usageLimit: true,
  usedCount: true,
  branchId: true,
  branch: {
    select: {
      id: true,
      name: true,
    },
  },
  createdAt: true,
} satisfies Prisma.CouponSelect

export type GetCouponItem = Prisma.CouponGetPayload<{
  select: typeof couponSelect
}>

export interface GetCouponsResponse {
  data: DecimalToNumber<GetCouponItem[]>
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getCoupons({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetCouponsParams): Promise<GetCouponsResponse> {
  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.CouponWhereInput = { storeId }

    if (search) {
      whereClause.OR = [
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [totalItems, coupons] = await Promise.all([
      prisma.coupon.count({ where: whereClause }),
      prisma.coupon.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: couponSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(coupons),
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

export async function createCoupon(input: CreateCouponInput) {
  try {
    const existing = await prisma.coupon.findUnique({
      where: { code: input.code },
      select: { id: true },
    })

    if (existing) {
      return { success: false, message: 'รหัสคูปองนี้ถูกใช้งานไปแล้ว' }
    }

    const coupon = await prisma.coupon.create({
      data: {
        ...input,
        startDate: new Date(input.startDate),
        endDate: new Date(input.endDate),
      },
      select: couponSelect,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: input.storeId,
      entity: 'Coupon',
      entityId: coupon.id,
      details: {
        code: input.code,
        discountType: input.discountType,
        type: 'created',
      },
    })

    return {
      success: true,
      message: 'สร้างคูปองสำเร็จ',
      data: serializeDecimal(coupon),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateCoupon(id: string, input: UpdateCouponInput) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Coupon ID' }
    }

    const updated = await prisma.coupon.update({
      where: { id },
      data: {
        ...input,
        ...(input.startDate && { startDate: new Date(input.startDate) }),
        ...(input.endDate && { endDate: new Date(input.endDate) }),
      },
      select: { ...couponSelect, storeId: true },
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: updated.storeId,
      entity: 'Coupon',
      entityId: id,
      details: { updatedFields: Object.keys(input), type: 'updated' },
    })

    return {
      success: true,
      message: 'อัปเดตคูปองสำเร็จ',
      data: serializeDecimal(updated),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteCoupon(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Coupon ID' }
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      select: { storeId: true, code: true },
    })

    await prisma.coupon.delete({ where: { id } })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: coupon?.storeId,
      entity: 'Coupon',
      entityId: id,
      details: { code: coupon?.code, type: 'deleted' },
    })

    return { success: true, message: 'ลบคูปองสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
