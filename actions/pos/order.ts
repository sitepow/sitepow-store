'use server'

import { Prisma } from '@/generated/prisma/client'
import {
  ActorType,
  LogAction,
  OrderStatus,
  PaymentMethod,
  ProductType,
} from '@/generated/prisma/enums'
import { calculateDiscounts, calculateEarnedPoints } from '@/utils/cart'
import { serializeDecimal } from '@/utils/decimal'
import { generateOrderNumber } from '@/utils/order'
import { deductCustomerPoints } from '@/utils/points'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export interface CreatePOSOrderInput {
  storeId: string
  branchId: string
  customerId?: string
  status?: OrderStatus
  paymentMethod: PaymentMethod
  receivedAmount?: number
  changeAmount?: number
  items: {
    productId: string
    variantId: string
    title: string
    variantTitle: string
    quantity: number
    price: number
    productType: ProductType
  }[]
  discountAmount?: number
  usedPoints?: number
}

export async function createPOSOrder(input: CreatePOSOrderInput) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: input.storeId,
      permission: 'canCreateOrder',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'ไม่มีสิทธิ์ในการสร้างคำสั่งซื้อ' }
    }

    if (!input.items.length) {
      return { success: false, message: 'ไม่มีรายการสินค้าในตะกร้า' }
    }

    const store = await prisma.store.findUnique({
      where: { id: input.storeId },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        phone: true,
        email: true,
        isPointsEnabled: true,
        pointEarningRate: true,
        pointRedeemRate: true,
      },
    })

    if (!store) {
      return { success: false, message: 'ไม่พบข้อมูลร้านค้า' }
    }

    const [employee, customer] = await Promise.all([
      prisma.employee.findUnique({
        where: { userId },
        select: { id: true },
      }),
      input.customerId
        ? prisma.customer.findUnique({
            where: { id: input.customerId },
            include: {
              addresses: {
                where: { isDefault: true },
                take: 1,
              },
            },
          })
        : null,
    ])

    let bankAccountId: string | null = null
    if (
      input.paymentMethod === PaymentMethod.MANUAL_QR_PROMPTPAY ||
      input.paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY
    ) {
      const defaultBank = await prisma.bankAccount.findFirst({
        where: { storeId: input.storeId, isDefault: true },
        select: { id: true },
      })
      bankAccountId = defaultBank?.id ?? null
    }

    const variantIds = Array.from(new Set(input.items.map((i) => i.variantId)))
    const variants = await prisma.productVariant.findMany({
      where: { id: { in: variantIds } },
      select: {
        id: true,
        weight: true,
        width: true,
        height: true,
        length: true,
      },
    })
    const variantMap = new Map(variants.map((v) => [v.id, v]))

    let totalWeight = 0
    let maxWidth = 0
    let maxHeight = 0
    let maxLength = 0

    input.items.forEach((item) => {
      const v = variantMap.get(item.variantId)
      if (v) {
        if (v.weight) totalWeight += Number(v.weight) * item.quantity
        if (v.width && Number(v.width) > maxWidth) maxWidth = Number(v.width)
        if (v.height && Number(v.height) > maxHeight)
          maxHeight = Number(v.height)
        if (v.length && Number(v.length) > maxLength)
          maxLength = Number(v.length)
      }
    })

    const subtotal = input.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    )

    const { pointsDiscount } = calculateDiscounts({
      subtotal,
      usedPoints: input.usedPoints ?? 0,
      pointRedeemRate: Number(store.pointRedeemRate ?? 0),
    })

    const manualDiscount = input.discountAmount ?? 0
    const finalTotal = Math.max(0, subtotal - pointsDiscount - manualDiscount)

    const earnedPoints = store.isPointsEnabled
      ? calculateEarnedPoints(finalTotal, Number(store.pointEarningRate ?? 0))
      : 0

    const orderNumber = generateOrderNumber()

    const createdOrder = await prisma.$transaction(async (tx) => {
      for (const item of input.items) {
        const stock = await tx.productStock.findUnique({
          where: {
            branchId_variantId: {
              branchId: input.branchId,
              variantId: item.variantId,
            },
          },
        })

        if (!stock || stock.quantity < item.quantity) {
          throw new Error(
            `สินค้า "${item.title} (${item.variantTitle})" มีจำนวนในสต็อกไม่เพียงพอ`,
          )
        }

        await tx.productStock.update({
          where: {
            branchId_variantId: {
              branchId: input.branchId,
              variantId: item.variantId,
            },
          },
          data: { quantity: { decrement: item.quantity } },
        })
      }

      const orderStatus =
        input.status ??
        (input.paymentMethod === PaymentMethod.CASH_ON_DELIVERY
          ? OrderStatus.SHIPPED
          : OrderStatus.PENDING)

      const defaultAddress = customer?.addresses?.[0] ?? null

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          totalAmount: finalTotal,
          totalAmountBase: finalTotal,
          status: orderStatus,
          paidAt:
            orderStatus === OrderStatus.PAID ||
            orderStatus === OrderStatus.SHIPPED
              ? new Date()
              : null,
          storeId: input.storeId,
          customerId: input.customerId ?? null,
          employeeId: employee?.id ?? null,
          paymentMethod: input.paymentMethod,
          bankAccountId,
          storeSnapshot: store as unknown as Prisma.InputJsonValue,
          shippingAddrSnapshot: defaultAddress
            ? (defaultAddress as unknown as Prisma.InputJsonValue)
            : Prisma.JsonNull,
          pointRedeemRateSnapshot: store.pointRedeemRate,
          usedPoints: input.usedPoints ?? 0,
          pointsDiscount,
          earnedPoints,
          totalWeight: totalWeight > 0 ? totalWeight : null,
          width: maxWidth > 0 ? maxWidth : null,
          height: maxHeight > 0 ? maxHeight : null,
          length: maxLength > 0 ? maxLength : null,
          items: {
            create: input.items.map((item) => ({
              productId: item.productId,
              variantId: item.variantId,
              title: item.title,
              variantTitle: item.variantTitle,
              quantity: item.quantity,
              price: item.price,
              branchId: input.branchId,
              productType: item.productType,
            })),
          },
        },
        include: {
          items: true,
          bankAccount: true,
        },
      })

      if (input.customerId) {
        if (input.usedPoints && input.usedPoints > 0) {
          await deductCustomerPoints({
            tx,
            customerId: input.customerId,
            storeId: input.storeId,
            usedPoints: input.usedPoints,
          })
        }
        await tx.customerStore.upsert({
          where: {
            customerId_storeId: {
              customerId: input.customerId,
              storeId: input.storeId,
            },
          },
          create: {
            customerId: input.customerId,
            storeId: input.storeId,
            totalSpent: finalTotal,
            rewardPoints: earnedPoints,
          },
          update: {
            totalSpent: { increment: finalTotal },
            rewardPoints: { increment: earnedPoints },
          },
        })
      }

      return newOrder
    })

    await createLog({
      action: LogAction.CREATE_ORDER,
      actorType: ActorType.MERCHANT,
      storeId: input.storeId,
      entity: 'Order',
      entityId: createdOrder.id,
      details: {
        type: 'POS',
        orderNumber: createdOrder.orderNumber,
        totalAmount: finalTotal,
        paymentMethod: input.paymentMethod,
        receivedAmount: input.receivedAmount,
        changeAmount: input.changeAmount,
      },
    })

    return {
      success: true,
      message: 'ทำรายการขายสำเร็จ',
      data: serializeDecimal(createdOrder),
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
    }
  }
}
