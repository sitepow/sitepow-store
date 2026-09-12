'use server'

import {
  ActorType,
  DiscountType,
  LogAction,
  Prisma,
} from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
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
  const emptyResponse: GetCouponsResponse = {
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
    const whereClause: Prisma.CouponWhereInput = {}

    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canViewCoupons',
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
    return emptyResponse
  }
}

export async function createCoupon(input: CreateCouponInput) {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canCreateCoupons',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const existing = await prisma.coupon.findUnique({
      where: {
        storeId_code: {
          storeId: input.storeId,
          code: input.code,
        },
      },
      select: { id: true },
    })

    if (existing) {
      return {
        success: false,
        messageTH: 'รหัสคูปองนี้ถูกใช้งานในร้านนี้ไปแล้ว',
        messageEN: 'This coupon code is already in use in this store',
        message: 'รหัสคูปองนี้ถูกใช้งานในร้านนี้ไปแล้ว',
      }
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
      messageTH: 'สร้างคูปองสำเร็จ',
      messageEN: 'Coupon created successfully',
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
      return {
        success: false,
        messageTH: 'ไม่พบ Coupon ID',
        messageEN: 'Coupon ID not found',
        message: 'ไม่พบ Coupon ID',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const existingCoupon = await prisma.coupon.findUnique({
      where: { id },
      select: { storeId: true, code: true },
    })

    if (!existingCoupon) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลคูปอง',
        messageEN: 'Coupon not found',
        message: 'ไม่พบข้อมูลคูปอง',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: existingCoupon.storeId,
      permission: 'canUpdateCoupons',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    if (input.code && input.code !== existingCoupon.code) {
      const duplicateCode = await prisma.coupon.findUnique({
        where: {
          storeId_code: {
            storeId: existingCoupon.storeId,
            code: input.code,
          },
        },
        select: { id: true },
      })

      if (duplicateCode) {
        return {
          success: false,
          messageTH: 'รหัสคูปองนี้ถูกใช้งานในร้านนี้ไปแล้ว',
          messageEN: 'This coupon code is already in use in this store',
          message: 'รหัสคูปองนี้ถูกใช้งานในร้านนี้ไปแล้ว',
        }
      }
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
      messageTH: 'อัปเดตคูปองสำเร็จ',
      messageEN: 'Coupon updated successfully',
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
      return {
        success: false,
        messageTH: 'ไม่พบ Coupon ID',
        messageEN: 'Coupon ID not found',
        message: 'ไม่พบ Coupon ID',
      }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return {
        success: false,
        messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: 'Please sign in to proceed',
        message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      }
    }

    const coupon = await prisma.coupon.findUnique({
      where: { id },
      select: { storeId: true, code: true },
    })

    if (!coupon || !coupon.storeId) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลคูปอง',
        messageEN: 'Coupon not found',
        message: 'ไม่พบข้อมูลคูปอง',
      }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: coupon.storeId,
      permission: 'canDeleteCoupons',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        messageTH: authCheck.messageTH || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        messageEN: authCheck.messageEN || 'Insufficient permissions',
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    await prisma.coupon.delete({ where: { id } })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: coupon.storeId,
      entity: 'Coupon',
      entityId: id,
      details: { code: coupon.code, type: 'deleted' },
    })

    return {
      success: true,
      messageTH: 'ลบคูปองสำเร็จ',
      messageEN: 'Coupon deleted successfully',
      message: 'ลบคูปองสำเร็จ',
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
