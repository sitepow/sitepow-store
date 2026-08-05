'use server'

import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction, OrderStatus } from '@/generated/prisma/enums'
import { ALL_STORES } from '@/stores/use-store-filter'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { cancelOrderCore } from '@/lib/order'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

interface GetOrdersParams {
  storeId: string
  branchId?: string
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
  paidAt: true,
  transactionId: true,
  createdAt: true,
  shippingFee: true,
  pointsDiscount: true,
  usedPoints: true,
  codFee: true,
  earnedPoints: true,
  storeId: true,
  pointRedeemRateSnapshot: true,
  pointEarningRateSnapshot: true,
  shippingAddrSnapshot: true,
  storeSnapshot: true,
  isTaxInvoiceRequested: true,
  taxName: true,
  taxId: true,
  taxAddress: true,
  taxBranchCode: true,
  totalWeight: true,
  width: true,
  height: true,
  length: true,
  customerCurrency: true,
  totalAmountBase: true,
  coupon: {
    select: {
      id: true,
      code: true,
      description: true,
      discountType: true,
      discountAmount: true,
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
    },
  },
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      avatar: true,
    },
  },
  employee: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  items: {
    select: {
      id: true,
      productId: true,
      title: true,
      variantId: true,
      variantTitle: true,
      quantity: true,
      price: true,
      customerNote: true,
      productType: true,
      branch: {
        select: {
          id: true,
          name: true,
          province: true,
          district: true,
        },
      },
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
  branchId,
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

  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return emptyResponse
  }

  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.OrderWhereInput = {}

    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canViewOrders',
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

    if (status) {
      whereClause.status = status
    }

    if (branchId && branchId !== ALL_STORES) {
      whereClause.items = {
        some: {
          branchId,
        },
      }
    }

    if (search) {
      whereClause.OR = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
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

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
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

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: order.storeId,
      permission: 'canUpdateOrders',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
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

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: { storeId: true },
    })

    if (!order) {
      return { success: false, message: 'ไม่พบข้อมูลออเดอร์' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: order.storeId,
      permission: 'canDeleteOrders',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    await cancelOrderCore({
      orderId: id,
      actorId: userId,
      actorType: ActorType.MERCHANT,
    })

    return { success: true, message: 'ยกเลิกออเดอร์และคืนสต็อกสำเร็จ' }
  } catch (error) {
    console.error(error)
    return {
      success: false,
    }
  }
}
