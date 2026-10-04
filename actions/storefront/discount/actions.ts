'use server'

import { DiscountType } from '@/generated/prisma/enums'

import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'

export interface StorefrontLoyaltyInfo {
  isPointsEnabled: boolean
  pointEarningRate: number
  pointRedeemRate: number
  customerPoints: number
}

const DEFAULT_LOYALTY: StorefrontLoyaltyInfo = {
  isPointsEnabled: false,
  pointEarningRate: 0,
  pointRedeemRate: 0,
  customerPoints: 0,
}

export async function getStorefrontLoyalty(
  storeSlug: string,
): Promise<StorefrontLoyaltyInfo> {
  try {
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: {
        id: true,
        isPointsEnabled: true,
        pointEarningRate: true,
        pointRedeemRate: true,
      },
    })

    if (!store) {
      return DEFAULT_LOYALTY
    }

    let customerPoints = 0

    if (userId) {
      const customer = await prisma.customer.findUnique({
        where: { userId },
        select: { id: true },
      })

      if (customer) {
        const customerStore = await prisma.customerStore.findUnique({
          where: {
            customerId_storeId: { customerId: customer.id, storeId: store.id },
          },
          select: { rewardPoints: true },
        })
        customerPoints = customerStore?.rewardPoints ?? 0
      }
    }

    return {
      isPointsEnabled: store.isPointsEnabled,
      pointEarningRate: Number(store.pointEarningRate ?? 0),
      pointRedeemRate: Number(store.pointRedeemRate ?? 0),
      customerPoints,
    }
  } catch (error) {
    console.error(error)
    return DEFAULT_LOYALTY
  }
}

export interface ValidateCouponInput {
  storeSlug: string
  code: string
  subtotal: number
}

export interface AppliedCouponData {
  id: string
  code: string
  discountAmount: number
}

export interface ValidateCouponResult {
  success: boolean
  message?: string
  data?: AppliedCouponData
}

export async function validateCoupon(
  input: ValidateCouponInput,
): Promise<ValidateCouponResult> {
  try {
    const { storeSlug, subtotal } = input
    const code = input.code.toLocaleUpperCase()

    if (!code) {
      return { success: false, message: 'กรุณากรอกรหัสส่วนลด' }
    }

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: { id: true },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบร้านค้า' }
    }

    const coupon = await prisma.coupon.findFirst({
      where: { code, storeId: store.id },
    })

    if (!coupon) {
      return { success: false, message: 'ไม่พบรหัสส่วนลดนี้' }
    }

    const now = new Date()
    if (now < coupon.startDate || now > coupon.endDate) {
      return {
        success: false,
        message: 'รหัสส่วนลดนี้หมดอายุหรือยังไม่เริ่มใช้งาน',
      }
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return { success: false, message: 'รหัสส่วนลดนี้ถูกใช้งานครบจำนวนแล้ว' }
    }

    const minOrderAmount = Number(coupon.minOrderAmount ?? 0)
    if (subtotal < minOrderAmount) {
      return {
        success: false,
        message: `ยอดสั่งซื้อขั้นต่ำ ${minOrderAmount.toLocaleString()} บาท สำหรับรหัสนี้`,
      }
    }

    let discountAmount =
      coupon.discountType === DiscountType.PERCENTAGE
        ? (subtotal * Number(coupon.discountAmount)) / 100
        : Number(coupon.discountAmount)

    if (coupon.maxDiscount) {
      discountAmount = Math.min(discountAmount, Number(coupon.maxDiscount))
    }

    discountAmount = Math.min(discountAmount, subtotal)

    return {
      success: true,
      message: 'ใช้รหัสส่วนลดสำเร็จ',
      data: {
        id: coupon.id,
        code: coupon.code,
        discountAmount,
      },
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
