'use server'

import {
  ActorType,
  LogAction,
  OrderStatus,
  PaymentMethod,
  ProductType,
} from '@/generated/prisma/enums'
import { serializeDecimal } from '@/utils/decimal'
import { generateOrderNumber } from '@/utils/order'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

export interface CreatePOSOrderInput {
  storeId: string
  branchId: string
  customerId?: string
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

    const employee = await prisma.employee.findUnique({
      where: { userId },
      select: { id: true },
    })

    const subtotal = input.items.reduce(
      (sum, i) => sum + i.price * i.quantity,
      0,
    )
    const finalTotal = Math.max(0, subtotal - (input.discountAmount ?? 0))
    const orderNumber = `POS-${generateOrderNumber()}`

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

      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          totalAmount: finalTotal,
          totalAmountBase: finalTotal,
          status: OrderStatus.PAID,
          paidAt: new Date(),
          storeId: input.storeId,
          customerId: input.customerId ?? null,
          employeeId: employee?.id ?? null,
          paymentMethod: input.paymentMethod,
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
        },
      })

      if (input.customerId) {
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
          },
          update: {
            totalSpent: { increment: finalTotal },
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
    console.error('POS Create Order Error:', error)
    return {
      success: false,
    }
  }
}
