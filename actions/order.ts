'use server'

import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction, OrderStatus } from '@/generated/prisma/enums'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
import { prisma } from '@/lib/prisma'

interface GetOrdersParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus
}

const orderSelect = {
  id: true,
  orderNumber: true,
  totalAmount: true,
  status: true,
  paymentMethod: true,
  shippingMethod: true,
  trackingNumber: true,
  paymentProof: true,
  createdAt: true,
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
      bankName: true,
      accountNumber: true,
      accountName: true,
    },
  },
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
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

export type GetOrdersItem = DecimalToNumber<
  Prisma.OrderGetPayload<{
    select: typeof orderSelect
  }>
>

export interface GetOrdersResponse {
  data: GetOrdersItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getOrders({
  storeId,
  page = 1,
  limit = 10,
  search,
  status,
}: GetOrdersParams): Promise<GetOrdersResponse> {
  const emptyResponse: GetOrdersResponse = {
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
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.OrderWhereInput = { storeId }

    if (status) {
      whereClause.status = status
    }

    if (search) {
      whereClause.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [totalItems, orders] = await Promise.all([
      prisma.order.count({ where: whereClause }),
      prisma.order.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: orderSelect,
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
    return emptyResponse
  }
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  trackingNumber?: string,
) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Order ID' }
    }

    if (status === OrderStatus.CANCELLED) {
      return await cancelOrder(id)
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: { storeId: true, orderNumber: true, status: true },
    })

    if (!order) {
      return { success: false, message: 'ไม่พบข้อมูลออเดอร์' }
    }

    await prisma.order.update({
      where: { id },
      data: {
        status,
        ...(trackingNumber ? { trackingNumber } : {}),
      },
    })

    await createLog({
      action: LogAction.UPDATE_ORDER_STATUS,
      actorType: ActorType.MERCHANT,
      storeId: order.storeId,
      entity: 'Order',
      entityId: id,
      details: {
        orderNumber: order.orderNumber,
        from: order.status,
        to: status,
        trackingNumber: trackingNumber || null,
      },
    })

    return { success: true, message: 'อัปเดตสถานะออเดอร์สำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function cancelOrder(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Order ID' }
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        storeId: true,
        orderNumber: true,
        status: true,
        items: {
          select: {
            quantity: true,
            variantId: true,
            branchId: true,
          },
        },
      },
    })

    if (!order) {
      return { success: false, message: 'ไม่พบข้อมูลออเดอร์' }
    }

    if (order.status === OrderStatus.CANCELLED) {
      return { success: false, message: 'ออเดอร์นี้ถูกยกเลิกไปแล้ว' }
    }

    await prisma.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.variantId && item.branchId) {
          await tx.productStock.update({
            where: {
              branchId_variantId: {
                branchId: item.branchId,
                variantId: item.variantId,
              },
            },
            data: {
              quantity: {
                increment: item.quantity,
              },
            },
          })
        }
      }

      await tx.order.update({
        where: { id },
        data: { status: OrderStatus.CANCELLED },
      })
    })

    await createLog({
      action: LogAction.CANCEL_ORDER,
      actorType: ActorType.MERCHANT,
      storeId: order.storeId,
      entity: 'Order',
      entityId: id,
      details: {
        orderNumber: order.orderNumber,
        from: order.status,
        to: OrderStatus.CANCELLED,
      },
    })

    return { success: true, message: 'ยกเลิกออเดอร์และคืนสต็อกสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
