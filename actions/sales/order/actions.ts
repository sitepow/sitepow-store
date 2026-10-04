'use server'

import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction, OrderStatus } from '@/generated/prisma/enums'
import { ALL_STORES } from '@/stores/use-store-filter'
import { DecimalToNumber, serializeDecimal } from '@/utils/shared/decimal'
import { earnCustomerPoints } from '@/utils/points/customer-points'

import { createLog } from '@/lib/activity/log'
import { getCurrentUser } from '@/lib/auth/server'
import { OrderEventPayload, appEvents } from '@/lib/redis/events'
import { cancelOrderCore } from '@/lib/order'
import { verifyEmployeePermission } from '@/lib/auth/permission'
import { prisma } from '@/lib/db/prisma'

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
  resellerAgreementId: true,
  resellerAgreement: {
    select: {
      id: true,
      resellerStore: {
        select: {
          id: true,
          name: true,
        },
      },
      resellerUser: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
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
      image: true,
      originalPrice: true,
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

export interface ShippingAddressSnapshot {
  name?: string
  receiverName?: string
  phone?: string
  addressLine?: string
  subDistrict?: string
  district?: string
  province?: string
  postalCode?: string
}

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

  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return emptyResponse
  }

  try {
    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.OrderWhereInput = {}

    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const resellerAgreement = await prisma.resellerAgreement.findFirst({
        where: {
          supplierStoreId: storeId,
          OR: [
            { resellerCustomerId: userId },
            { resellerStore: { ownerId: userId } },
          ],
        },
        select: { id: true },
      })

      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canViewOrders',
      })

      const isStoreOwner = await prisma.store.findFirst({
        where: { id: storeId, ownerId: userId },
        select: { id: true },
      })

      if (resellerAgreement && !isStoreOwner) {
        whereClause.storeId = storeId
        whereClause.resellerAgreementId = resellerAgreement.id
      } else if (authCheck.isAuthorized) {
        whereClause.storeId = storeId
      } else {
        return emptyResponse
      }
    } else {
      const userStores = await prisma.store.findMany({
        where: { ownerId: userId },
        select: { id: true },
      })
      const storeIds = userStores.map((s) => s.id)

      const resellerAgreements = await prisma.resellerAgreement.findMany({
        where: {
          OR: [
            { resellerCustomerId: userId },
            { resellerStore: { ownerId: userId } },
          ],
        },
        select: { id: true },
      })

      const resellerAgreementIds = resellerAgreements.map((a) => a.id)

      if (storeIds.length === 0 && resellerAgreementIds.length === 0) {
        return emptyResponse
      }

      whereClause.OR = [
        ...(storeIds.length > 0 ? [{ storeId: { in: storeIds } }] : []),
        ...(resellerAgreementIds.length > 0
          ? [{ resellerAgreementId: { in: resellerAgreementIds } }]
          : []),
      ]
    }

    if (status) {
      whereClause.status = status
    }

    if (branchId && branchId !== ALL_STORES) {
      whereClause.items = {
        some: { branchId },
      }
    }

    if (search) {
      const searchConditions: Prisma.OrderWhereInput[] = [
        { orderNumber: { contains: search, mode: 'insensitive' } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } },
        { customer: { phone: { contains: search, mode: 'insensitive' } } },
        {
          resellerAgreement: {
            resellerStore: { name: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          resellerAgreement: {
            resellerUser: { name: { contains: search, mode: 'insensitive' } },
          },
        },
        {
          resellerAgreement: {
            resellerUser: { email: { contains: search, mode: 'insensitive' } },
          },
        },
      ]

      if (whereClause.OR) {
        whereClause.AND = [{ OR: whereClause.OR }, { OR: searchConditions }]
        delete whereClause.OR
      } else {
        whereClause.OR = searchConditions
      }
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

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    if (status === OrderStatus.CANCELLED) {
      return await cancelOrder(id)
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        storeId: true,
        orderNumber: true,
        status: true,
        customerId: true,
        earnedPoints: true,
      },
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

    const isBecomingShipped = status === OrderStatus.SHIPPED
    const wasAlreadyShipped = order.status === OrderStatus.SHIPPED

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id },
        data: {
          status,
          ...(trackingNumber ? { trackingNumber } : {}),
        },
      })

      if (
        isBecomingShipped &&
        !wasAlreadyShipped &&
        order.customerId &&
        order.earnedPoints &&
        order.earnedPoints > 0
      ) {
        await earnCustomerPoints({
          tx,
          customerId: order.customerId,
          storeId: order.storeId,
          earnedPoints: order.earnedPoints,
        })
      }
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

    appEvents.publish<OrderEventPayload>(`order:${order.storeId}`, {
      type: 'ORDER_UPDATED',
      orderId: id,
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

    const userSession = await getCurrentUser()
    const currentUserId = userSession?.id

    if (!currentUserId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: {
        id: true,
        storeId: true,
        status: true,
        customerId: true,
        customer: {
          select: {
            id: true,
            userId: true,
          },
        },
        store: {
          select: {
            ownerId: true,
          },
        },
        resellerAgreement: {
          select: {
            resellerCustomerId: true,
            resellerStore: {
              select: {
                ownerId: true,
              },
            },
          },
        },
      },
    })

    if (!order) {
      return { success: false, message: 'ไม่พบข้อมูลออเดอร์' }
    }

    const isOrderCustomer =
      order.customerId === currentUserId ||
      order.customer?.id === currentUserId ||
      order.customer?.userId === currentUserId

    const isStoreOwner = order.store?.ownerId === currentUserId

    const isResellerOwner =
      order.resellerAgreement?.resellerCustomerId === currentUserId ||
      order.resellerAgreement?.resellerStore?.ownerId === currentUserId

    if (
      order.status === OrderStatus.PAID &&
      (isResellerOwner || isOrderCustomer)
    ) {
      return {
        success: false,
        message: 'ออเดอร์ที่ชำระเงินแล้ว ไม่สามารถยกเลิกได้',
      }
    }

    let actorType: ActorType = ActorType.MERCHANT

    if (!isOrderCustomer && !isStoreOwner && !isResellerOwner) {
      const authCheck = await verifyEmployeePermission({
        userId: currentUserId,
        storeId: order.storeId,
        permission: 'canDeleteOrders',
      })

      if (!authCheck.isAuthorized) {
        return {
          success: false,
          message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
        }
      }
    } else if ((isOrderCustomer || isResellerOwner) && !isStoreOwner) {
      actorType = ActorType.SYSTEM
    }

    await cancelOrderCore({
      orderId: id,
      actorType,
    })

    appEvents.publish<OrderEventPayload>(`order:${order.storeId}`, {
      type: 'ORDER_CANCELLED',
      orderId: id,
    })

    return { success: true, message: 'ยกเลิกออเดอร์และคืนสต็อกสำเร็จ' }
  } catch (error: unknown) {
    console.error(error)
    let errorMessage

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return {
      success: false,
      message: errorMessage,
    }
  }
}
