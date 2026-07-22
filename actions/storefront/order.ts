'use server'

import { Prisma } from '@/generated/prisma/client'
import {
  ActorType,
  DeliveryStatus,
  LogAction,
  OrderStatus,
  PaymentMethod,
  ProductType,
} from '@/generated/prisma/enums'
import { calculateDiscounts } from '@/utils/cart'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import crypto from 'crypto'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export interface CreateOrderItemInput {
  productId: string
  variantId: string
  title: string
  variantTitle: string
  quantity: number
  price: number
  productType: ProductType
}

export interface CreateOrderInput {
  storeSlug: string
  addressId: string
  shippingMethod: string
  shippingFee: number
  storeCourierServiceId?: string
  paymentMethod: PaymentMethod
  bankAccountId?: string
  couponId?: string
  couponDiscount?: number
  usedPoints?: number
  pointsDiscount?: number
  earnedPoints?: number
  items: CreateOrderItemInput[]
}

const orderSelect = {
  id: true,
  orderNumber: true,
  totalAmount: true,
  status: true,
} satisfies Prisma.OrderSelect

function generateOrderNumber() {
  const date = new Date()
  const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`
  const randomPart = crypto.randomInt(1000, 9999)
  return `SP${datePart}${randomPart}`
}

const storefrontOrderSelect = {
  id: true,
  orderNumber: true,
  totalAmount: true,
  status: true,
  paymentMethod: true,
  trackingNumber: true,
  deliveryStatus: true,
  createdAt: true,
  customerId: true,
  bankAccountId: true,
  shippingMethod: true,
  shippingFee: true,
  pointsDiscount: true,
  usedPoints: true,
  codFee: true,
  coupon: {
    select: {
      code: true,
      description: true,
    },
  },
  bankAccount: {
    select: {
      id: true,
      bankName: true,
      accountNumber: true,
      accountName: true,
      type: true,
      promptPayId: true,
      qrImage: true,
      isDefault: true,
    },
  },
  store: {
    select: {
      id: true,
      name: true,
      logo: true,
    },
  },
  items: {
    select: {
      id: true,
      title: true,
      variantTitle: true,
      quantity: true,
      price: true,
    },
  },
} satisfies Prisma.OrderSelect

export type GetStorefrontOrderItem = Prisma.OrderGetPayload<{
  select: typeof storefrontOrderSelect
}>

export type GetStorefrontOrderItemSerialized =
  DecimalToNumber<GetStorefrontOrderItem>

export interface GetStorefrontOrdersResponse {
  data: GetStorefrontOrderItemSerialized[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

interface GetStorefrontOrdersParams {
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus
}

export async function getStorefrontOrders({
  page = 1,
  limit = 10,
  search,
  status,
}: GetStorefrontOrdersParams = {}): Promise<GetStorefrontOrdersResponse> {
  const empty = {
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

  try {
    const session = await auth()
    if (!session?.user?.id) {
      return empty
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!customer) {
      return empty
    }

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.OrderWhereInput = { customerId: customer.id }

    if (status) {
      whereClause.status = status
    }

    if (search) {
      whereClause.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { store: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [totalItems, orders] = await Promise.all([
      prisma.order.count({ where: whereClause }),
      prisma.order.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: storefrontOrderSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: orders.map((o) => serializeDecimal(o)),
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
    return empty
  }
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนสั่งซื้อสินค้า' }
    }

    if (!input.items.length) {
      return { success: false, message: 'ไม่พบสินค้าในตะกร้า' }
    }

    const customer = await prisma.customer.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    })

    if (!customer) {
      return { success: false, message: 'ไม่พบข้อมูลลูกค้า' }
    }

    const address = await prisma.address.findFirst({
      where: { id: input.addressId, customerId: customer.id },
    })

    if (!address) {
      return { success: false, message: 'ไม่พบที่อยู่จัดส่งที่เลือก' }
    }

    const store = await prisma.store.findUnique({
      where: { slug: input.storeSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        isPointsEnabled: true,
        pointRedeemRate: true,
      },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบร้านค้า' }
    }

    const branch = await prisma.branch.findFirst({
      where: { storeId: store.id, isMain: true },
      select: { id: true },
    })

    if (!branch) {
      return {
        success: false,
        message: 'ร้านค้ายังไม่มีสาขาสำหรับจัดส่งสินค้า',
      }
    }

    let subtotal = 0
    for (const item of input.items) {
      if (item.quantity <= 0) {
        return { success: false, message: 'จำนวนสินค้าต้องมากกว่า 0' }
      }

      const stock = await prisma.productStock.findUnique({
        where: {
          branchId_variantId: {
            branchId: branch.id,
            variantId: item.variantId,
          },
        },
        select: { quantity: true },
      })

      if (!stock || stock.quantity < item.quantity) {
        return {
          success: false,
          message: `สินค้า "${item.title} - ${item.variantTitle}" มีสต็อกไม่เพียงพอ`,
        }
      }

      subtotal += item.price * item.quantity
    }

    let couponData = undefined
    if (input.couponId) {
      const coupon = await prisma.coupon.findUnique({
        where: { id: input.couponId },
      })

      if (!coupon || coupon.storeId !== store.id) {
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

      if (subtotal < Number(coupon.minOrderAmount ?? 0)) {
        return {
          success: false,
          message: `ยอดสั่งซื้อขั้นต่ำ ${Number(coupon.minOrderAmount ?? 0).toLocaleString()} บาท สำหรับรหัสนี้`,
        }
      }

      couponData = {
        discountType: coupon.discountType,
        discountAmount: Number(coupon.discountAmount),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      }
    }

    const { couponDiscount, pointsDiscount } = calculateDiscounts({
      subtotal,
      coupon: couponData,
      usedPoints: input.usedPoints ?? 0,
      pointRedeemRate: Number(store.pointRedeemRate ?? 0),
    })

    const shippingFee = input.shippingFee ?? 0
    const totalAmount = Math.max(
      0,
      subtotal + shippingFee - couponDiscount - pointsDiscount,
    )
    const orderNumber = generateOrderNumber()

    const order = await prisma.$transaction(async (tx) => {
      for (const item of input.items) {
        await tx.productStock.update({
          where: {
            branchId_variantId: {
              branchId: branch.id,
              variantId: item.variantId,
            },
          },
          data: { quantity: { decrement: item.quantity } },
        })
      }

      if (input.couponId) {
        await tx.coupon.update({
          where: { id: input.couponId },
          data: { usedCount: { increment: 1 } },
        })
      }

      await tx.customerStore.upsert({
        where: {
          customerId_storeId: { customerId: customer.id, storeId: store.id },
        },
        create: {
          customerId: customer.id,
          storeId: store.id,
          totalSpent: totalAmount,
          rewardPoints: Math.max(
            0,
            (input.earnedPoints ?? 0) - (input.usedPoints ?? 0),
          ),
        },
        update: {
          totalSpent: { increment: totalAmount },
          rewardPoints: {
            increment: (input.earnedPoints ?? 0) - (input.usedPoints ?? 0),
          },
        },
      })

      return await tx.order.create({
        data: {
          orderNumber,
          totalAmount,
          status: OrderStatus.PENDING,
          deliveryStatus: DeliveryStatus.PENDING,
          storeId: store.id,
          customerId: customer.id,
          couponId: input.couponId,
          paymentMethod: input.paymentMethod,
          bankAccountId: input.bankAccountId,
          shippingMethod: input.shippingMethod,
          shippingFee,
          usedPoints: input.usedPoints ?? 0,
          pointsDiscount,
          earnedPoints: input.earnedPoints ?? 0,
          pointRedeemRateSnapshot: store.pointRedeemRate,
          shippingAddrSnapshot: address as unknown as Prisma.InputJsonValue,
          storeSnapshot: store as unknown as Prisma.InputJsonValue,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              title: item.title,
              variantTitle: item.variantTitle,
              quantity: item.quantity,
              price: item.price,
              branchId: branch.id,
              productType: item.productType,
            })),
          },
        },
        select: orderSelect,
      })
    })

    await createLog({
      action: LogAction.CREATE_ORDER,
      actorType: ActorType.SYSTEM,
      storeId: store.id,
      entity: 'Order',
      entityId: order.id,
      details: {
        orderNumber: order.orderNumber,
        totalAmount,
        couponDiscount,
        pointsDiscount,
        paymentMethod: input.paymentMethod,
        itemCount: input.items.length,
      },
    })

    return {
      success: true,
      message: 'สั่งซื้อสินค้าสำเร็จแล้ว',
      data: serializeDecimal(order),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
