'use server'

import { DiscountType } from '@/generated/prisma/enums'

import { getCurrentUser } from '@/lib/auth-server'
import { prisma } from '@/lib/prisma'

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
  messageTH?: string
  messageEN?: string
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
      return {
        success: false,
        messageTH: 'กรุณากรอกรหัสส่วนลด',
        messageEN: 'Please enter a coupon code',
      }
    }

    const store = await prisma.store.findUnique({
      where: { slug: storeSlug },
      select: { id: true },
    })

    if (!store) {
      return {
        success: false,
        messageTH: 'ไม่พบร้านค้า',
        messageEN: 'Store not found',
      }
    }

    const coupon = await prisma.coupon.findFirst({
      where: { code, storeId: store.id },
    })

    if (!coupon) {
      return {
        success: false,
        messageTH: 'ไม่พบรหัสส่วนลดนี้',
        messageEN: 'Coupon code not found',
      }
    }

    const now = new Date()
    if (now < coupon.startDate || now > coupon.endDate) {
      return {
        success: false,
        messageTH: 'รหัสส่วนลดนี้หมดอายุหรือยังไม่เริ่มใช้งาน',
        messageEN: 'This coupon has expired or is not yet active',
      }
    }

    if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) {
      return {
        success: false,
        messageTH: 'รหัสส่วนลดนี้ถูกใช้งานครบจำนวนแล้ว',
        messageEN: 'This coupon usage limit has been reached',
      }
    }

    const minOrderAmount = Number(coupon.minOrderAmount ?? 0)
    if (subtotal < minOrderAmount) {
      return {
        success: false,
        messageTH: `ยอดสั่งซื้อขั้นต่ำ ${minOrderAmount.toLocaleString()} บาท สำหรับรหัสนี้`,
        messageEN: `Minimum order of ${minOrderAmount.toLocaleString()} THB required for this coupon`,
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
      messageTH: 'ใช้รหัสส่วนลดสำเร็จ',
      messageEN: 'Coupon applied successfully',
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
