'use server'

import { Prisma } from '@/generated/prisma/client'
import { ActorType, LogAction, OrderStatus } from '@/generated/prisma/enums'
import { ALL_STORES } from '@/stores/merchant/use-store-filter'
import { earnCustomerPoints } from '@/utils/points/customer-points'
import { DecimalToNumber, serializeDecimal } from '@/utils/shared/decimal'

import { createLog } from '@/lib/activity/log'
import { verifyEmployeePermission } from '@/lib/auth/permission'
import { getCurrentUser } from '@/lib/auth/server'
import { prisma } from '@/lib/db/prisma'
import { cancelOrderCore } from '@/lib/order'
import { OrderEventPayload, appEvents } from '@/lib/redis/events'
import { dispatchOrderWebhook } from '@/lib/webhook/dispatcher'

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
  store: {
    select: {
      id: true,
      name: true,
      slug: true,
      email: true,
      phone: true,
      logo: true,
      taxId: true,
      isVatRegistered: true,
      vatRate: true,
      branches: {
        select: {
          id: true,
          name: true,
          isMain: true,
          address: true,
          province: true,
          district: true,
          subDistrict: true,
          postcode: true,
        },
      },
    },
  },
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

    const trackingMsg = trackingNumber ? ` (เลขพัสดุ: ${trackingNumber})` : ''

    await createLog({
      action: LogAction.UPDATE_ORDER_STATUS,
      actorType: ActorType.MERCHANT,
      storeId: order.storeId,
      entity: 'Order',
      entityId: id,
      details: {
        summary: `อัปเดตคำสั่งซื้อ #${order.orderNumber} จาก "${order.status}" เป็น "${status}"${trackingMsg}`,
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

    if (status === OrderStatus.PAID) {
      dispatchOrderWebhook({
        storeId: order.storeId,
        event: 'order.paid',
        orderId: id,
      }).catch((err) => console.error('Webhook dispatch error:', err))
    } else if (status === OrderStatus.SHIPPED) {
      dispatchOrderWebhook({
        storeId: order.storeId,
        event: 'order.shipped',
        orderId: id,
      }).catch((err) => console.error('Webhook dispatch error:', err))
    }

    dispatchOrderWebhook({
      storeId: order.storeId,
      event: 'order.updated',
      orderId: id,
    }).catch((err) => console.error('Webhook dispatch error:', err))

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

export interface UpdateOrderTaxInfoInput {
  isTaxInvoiceRequested?: boolean
  taxName?: string | null
  taxId?: string | null
  taxAddress?: string | null
  taxBranchCode?: string | null
}

export async function updateOrderTaxInfo(
  id: string,
  input: UpdateOrderTaxInfoInput,
) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบหมายเลขคำสั่งซื้อ' }
    }

    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const order = await prisma.order.findUnique({
      where: { id },
      select: { storeId: true, orderNumber: true },
    })

    if (!order) {
      return { success: false, message: 'ไม่พบข้อมูลคำสั่งซื้อ' }
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

    const updateData: {
      isTaxInvoiceRequested?: boolean
      taxName?: string | null
      taxId?: string | null
      taxAddress?: string | null
      taxBranchCode?: string | null
    } = {}

    if (input.isTaxInvoiceRequested !== undefined) {
      updateData.isTaxInvoiceRequested = input.isTaxInvoiceRequested
    }
    if (input.taxName !== undefined) {
      updateData.taxName = input.taxName ? input.taxName.trim() : null
    }
    if (input.taxId !== undefined) {
      updateData.taxId = input.taxId ? input.taxId.trim() : null
    }
    if (input.taxAddress !== undefined) {
      updateData.taxAddress = input.taxAddress ? input.taxAddress.trim() : null
    }
    if (input.taxBranchCode !== undefined) {
      updateData.taxBranchCode = input.taxBranchCode
        ? input.taxBranchCode.trim()
        : null
    }

    const updated = await prisma.order.update({
      where: { id },
      data: updateData,
    })

    await createLog({
      action: LogAction.UPDATE_ORDER_STATUS,
      actorType: ActorType.MERCHANT,
      storeId: order.storeId,
      entity: 'Order',
      entityId: id,
      details: {
        summary: `แก้ไขข้อมูลใบกำกับภาษี คำสั่งซื้อ #${order.orderNumber}`,
        type: 'UPDATE_TAX_INFO',
        orderNumber: order.orderNumber,
        ...input,
      } as Prisma.InputJsonObject,
    })

    return {
      success: true,
      message: 'บันทึกข้อมูลใบกำกับภาษีเรียบร้อยแล้ว',
      data: serializeDecimal(updated),
    }
  } catch (error) {
    console.error('Error updating order tax info:', error)
    return { success: false, message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' }
  }
}
