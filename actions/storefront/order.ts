'use server'

import { Prisma } from '@/generated/prisma/client'
import {
  ActorType,
  LogAction,
  OrderStatus,
  ProductType,
} from '@/generated/prisma/enums'
import { CreateOrderInput } from '@/types/order'
import { calculateDiscounts } from '@/utils/cart'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import {
  calculateGroupShare,
  classifyOrderItems,
  generateOrderNumber,
} from '@/utils/order'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { requireVerifiedUser } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

const storefrontOrderSelect = {
  id: true,
  orderNumber: true,
  totalAmount: true,
  status: true,
  paymentMethod: true,
  trackingNumber: true,
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
      branch: true,
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
    const { isAuthorized, message, userId } = await requireVerifiedUser()

    if (!isAuthorized) {
      return { success: false, message }
    }

    if (!input.items.length) {
      return { success: false, message: 'ไม่พบสินค้าในตะกร้า' }
    }

    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!customer) {
      return { success: false, message: 'ไม่พบข้อมูลลูกค้า' }
    }

    const hasPhysical = input.items.some(
      (item) => item.productType === ProductType.PHYSICAL,
    )

    let address = null
    if (hasPhysical) {
      address = await prisma.address.findFirst({
        where: { id: input.addressId, customerId: customer.id },
      })
      if (!address) {
        return { success: false, message: 'ไม่พบที่อยู่จัดส่งที่เลือก' }
      }
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

    const mainBranch = await prisma.branch.findFirst({
      where: { storeId: store.id, isMain: true },
      select: { id: true },
    })

    for (const item of input.items) {
      if (item.quantity <= 0) {
        return { success: false, message: 'จำนวนสินค้าต้องมากกว่า 0' }
      }
      if (item.productType === ProductType.PHYSICAL && !item.branchId) {
        return {
          success: false,
          message: `ไม่พบข้อมูลสาขาสำหรับสินค้า ${item.title} กรุณาเลือกสาขาที่ต้องการรับสินค้า`,
        }
      }
    }

    const { physicalGroups, digitalItems, digitalServices } =
      classifyOrderItems(input.items)

    for (const [branchId, groupItems] of Object.entries(physicalGroups)) {
      for (const item of groupItems) {
        const stock = await prisma.productStock.findUnique({
          where: {
            branchId_variantId: { branchId, variantId: item.variantId },
          },
          select: { quantity: true },
        })

        if (!stock || stock.quantity < item.quantity) {
          return {
            success: false,
            message: `สินค้า "${item.title} - ${item.variantTitle}" ในสาขานี้มีสต็อกไม่เพียงพอ`,
          }
        }
      }
    }

    const subtotalAll = input.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    )

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

      if (subtotalAll < Number(coupon.minOrderAmount ?? 0)) {
        return {
          success: false,
          message: 'ยอดสั่งซื้อไม่ถึงขั้นต่ำสำหรับรหัสส่วนลดนี้',
        }
      }

      couponData = {
        discountType: coupon.discountType,
        discountAmount: Number(coupon.discountAmount),
        maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
      }
    }

    const { couponDiscount, pointsDiscount } = calculateDiscounts({
      subtotal: subtotalAll,
      coupon: couponData,
      usedPoints: input.usedPoints ?? 0,
      pointRedeemRate: Number(store.pointRedeemRate ?? 0),
    })

    const branchIds = Object.keys(physicalGroups)

    const createdOrders = await prisma.$transaction(async (tx) => {
      const orders = []
      const baseOrderNumber = generateOrderNumber()
      let orderCounter = 1

      for (const branchId of branchIds) {
        const groupItems = physicalGroups[branchId]
        const groupSubtotal = groupItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0,
        )

        const share = calculateGroupShare({
          groupSubtotal,
          totalGrandSubtotal: subtotalAll,
          totalShippingFee: input.shippingFee ?? 0,
          branchCount: branchIds.length,
          couponDiscount,
          pointsDiscount,
          usedPoints: input.usedPoints ?? 0,
          earnedPoints: input.earnedPoints ?? 0,
        })

        const groupTotalAmount = Math.max(
          0,
          groupSubtotal +
            share.shippingFee -
            share.couponDiscount -
            share.pointsDiscount,
        )

        for (const item of groupItems) {
          await tx.productStock.update({
            where: {
              branchId_variantId: { branchId, variantId: item.variantId },
            },
            data: { quantity: { decrement: item.quantity } },
          })
        }

        const subOrderNumber =
          branchIds.length > 1 ||
          digitalItems.length > 0 ||
          digitalServices.length > 0
            ? `${baseOrderNumber}-${orderCounter++}`
            : baseOrderNumber

        const newOrder = await tx.order.create({
          data: {
            orderNumber: subOrderNumber,
            totalAmount: groupTotalAmount,
            totalAmountBase: groupTotalAmount,
            status: OrderStatus.PENDING,
            storeId: store.id,
            customerId: customer.id,
            couponId: input.couponId,
            paymentMethod: input.paymentMethod,
            bankAccountId: input.bankAccountId,
            shippingMethod: input.shippingMethod,
            shippingFee: share.shippingFee,
            usedPoints: share.usedPoints,
            pointsDiscount: share.pointsDiscount,
            earnedPoints: share.earnedPoints,
            pointRedeemRateSnapshot: store.pointRedeemRate,
            shippingAddrSnapshot: address as unknown as Prisma.InputJsonValue,
            storeSnapshot: store as unknown as Prisma.InputJsonValue,
            items: {
              create: groupItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                title: item.title,
                variantTitle: item.variantTitle,
                quantity: item.quantity,
                price: item.price,
                branchId,
                productType: item.productType,
              })),
            },
          },
          select: storefrontOrderSelect,
        })
        orders.push(newOrder)
      }

      if (digitalItems.length > 0) {
        const digitalSubtotal = digitalItems.reduce(
          (sum, i) => sum + i.price * i.quantity,
          0,
        )
        const share = calculateGroupShare({
          groupSubtotal: digitalSubtotal,
          totalGrandSubtotal: subtotalAll,
          totalShippingFee: input.shippingFee ?? 0,
          branchCount: branchIds.length,
          couponDiscount,
          pointsDiscount,
          usedPoints: input.usedPoints ?? 0,
          earnedPoints: input.earnedPoints ?? 0,
        })

        const digitalTotalAmount = Math.max(
          0,
          digitalSubtotal - share.couponDiscount - share.pointsDiscount,
        )
        const subOrderNumber = `${baseOrderNumber}-${orderCounter++}`

        const newOrder = await tx.order.create({
          data: {
            orderNumber: subOrderNumber,
            totalAmount: digitalTotalAmount,
            totalAmountBase: digitalTotalAmount,
            status: OrderStatus.PENDING,
            storeId: store.id,
            customerId: customer.id,
            paymentMethod: input.paymentMethod,
            bankAccountId: input.bankAccountId,
            shippingFee: 0,
            usedPoints: share.usedPoints,
            pointsDiscount: share.pointsDiscount,
            earnedPoints: share.earnedPoints,
            storeSnapshot: store as unknown as Prisma.InputJsonValue,
            items: {
              create: digitalItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                title: item.title,
                variantTitle: item.variantTitle,
                quantity: item.quantity,
                price: item.price,
                branchId: mainBranch?.id || '',
                productType: item.productType,
              })),
            },
          },
          select: storefrontOrderSelect,
        })

        for (const item of digitalItems) {
          const availableItems = await tx.digitalItem.findMany({
            where: { variantId: item.variantId, isUsed: false },
            take: item.quantity,
            select: { id: true },
          })

          if (availableItems.length > 0) {
            await tx.digitalItem.updateMany({
              where: { id: { in: availableItems.map((i) => i.id) } },
              data: { isUsed: true, orderId: newOrder.id },
            })
          }
        }
        orders.push(newOrder)
      }

      for (const serviceItem of digitalServices) {
        const serviceSubtotal = serviceItem.price * serviceItem.quantity
        const share = calculateGroupShare({
          groupSubtotal: serviceSubtotal,
          totalGrandSubtotal: subtotalAll,
          totalShippingFee: input.shippingFee ?? 0,
          branchCount: branchIds.length,
          couponDiscount,
          pointsDiscount,
          usedPoints: input.usedPoints ?? 0,
          earnedPoints: input.earnedPoints ?? 0,
        })

        const serviceTotalAmount = Math.max(
          0,
          serviceSubtotal - share.couponDiscount - share.pointsDiscount,
        )
        const subOrderNumber = `${baseOrderNumber}-${orderCounter++}`

        const newOrder = await tx.order.create({
          data: {
            orderNumber: subOrderNumber,
            totalAmount: serviceTotalAmount,
            totalAmountBase: serviceTotalAmount,
            status: OrderStatus.PENDING,
            storeId: store.id,
            customerId: customer.id,
            paymentMethod: input.paymentMethod,
            bankAccountId: input.bankAccountId,
            shippingFee: 0,
            usedPoints: share.usedPoints,
            pointsDiscount: share.pointsDiscount,
            earnedPoints: share.earnedPoints,
            storeSnapshot: store as unknown as Prisma.InputJsonValue,
            items: {
              create: [
                {
                  productId: serviceItem.productId,
                  variantId: serviceItem.variantId,
                  title: serviceItem.title,
                  variantTitle: serviceItem.variantTitle,
                  quantity: serviceItem.quantity,
                  price: serviceItem.price,
                  branchId: mainBranch?.id || '',
                  productType: serviceItem.productType,
                },
              ],
            },
          },
          select: storefrontOrderSelect,
        })
        orders.push(newOrder)
      }

      if (input.couponId) {
        await tx.coupon.update({
          where: { id: input.couponId },
          data: { usedCount: { increment: 1 } },
        })
      }

      const grandTotalAmount = orders.reduce(
        (sum, o) => sum + Number(o.totalAmount),
        0,
      )
      await tx.customerStore.upsert({
        where: {
          customerId_storeId: { customerId: customer.id, storeId: store.id },
        },
        create: {
          customerId: customer.id,
          storeId: store.id,
          totalSpent: grandTotalAmount,
          rewardPoints: Math.max(
            0,
            (input.earnedPoints ?? 0) - (input.usedPoints ?? 0),
          ),
        },
        update: {
          totalSpent: { increment: grandTotalAmount },
          rewardPoints: {
            increment: (input.earnedPoints ?? 0) - (input.usedPoints ?? 0),
          },
        },
      })

      return orders
    })

    await createLog({
      action: LogAction.CREATE_ORDER,
      actorType: ActorType.SYSTEM,
      storeId: store.id,
      entity: 'Order',
      entityId: createdOrders[0]?.id || '',
      details: {
        orderCount: createdOrders.length,
        orderNumbers: createdOrders.map((o) => o.orderNumber),
        paymentMethod: input.paymentMethod,
      },
    })

    return {
      success: true,
      message: 'สั่งซื้อสินค้าสำเร็จแล้ว',
      data: serializeDecimal(createdOrders[0]),
      allOrders: serializeDecimal(createdOrders),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
