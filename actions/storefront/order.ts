'use server'

import { Prisma } from '@/generated/prisma/client'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import { sendNewOrderNotificationEmail } from '@/utils/store-staff'

import { getCurrentUser } from '@/lib/auth-server'
import { createOrderCore } from '@/lib/order'
import { CreateOrderInput } from '@/lib/order/types'
import { requireVerifiedUser } from '@/lib/permission'
import { prisma } from '@/lib/prisma'
import { dispatchStoreWebhook } from '@/lib/webhook'

const storefrontOrderSelect = {
  id: true,
  orderNumber: true,
  totalAmount: true,
  status: true,
  paymentMethod: true,
  trackingNumber: true,
  createdAt: true,
  paidAt: true,
  customerId: true,
  bankAccountId: true,
  shippingMethod: true,
  shippingFee: true,
  pointsDiscount: true,
  usedPoints: true,
  codFee: true,
  earnedPoints: true,
  shippingAddrSnapshot: true,
  isTaxInvoiceRequested: true,
  taxName: true,
  taxId: true,
  taxBranchCode: true,
  taxAddress: true,
  paymentProof: true,
  totalWeight: true,
  width: true,
  height: true,
  length: true,
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
      image: true,
      originalPrice: true,
      branch: true,
      customerNote: true,
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
  storeSlug?: string
}

export async function getStorefrontOrders({
  page = 1,
  limit = 10,
  search,
  status,
  storeSlug,
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
    const userSession = await getCurrentUser()
    const userId = userSession?.id

    if (!userId) {
      return empty
    }

    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!customer) {
      return empty
    }

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.OrderWhereInput = {
      customerId: customer.id,
      ...(storeSlug ? { store: { slug: storeSlug } } : {}),
    }

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
    const { isAuthorized, messageTH, messageEN, userId } =
      await requireVerifiedUser()

    if (!isAuthorized) {
      return {
        success: false,
        messageTH: messageTH || 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
        messageEN: messageEN || 'Please sign in to proceed',
      }
    }

    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        user: { select: { name: true } },
      },
    })

    if (!customer) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลลูกค้า',
        messageEN: 'Customer data not found',
      }
    }

    const store = await prisma.store.findUnique({
      where: { slug: input.storeSlug },
      select: { id: true, name: true },
    })

    if (!store) {
      return {
        success: false,
        messageTH: 'ไม่พบร้านค้า',
        messageEN: 'Store not found',
      }
    }

    const createdOrders = await createOrderCore({
      storeId: store.id,
      customerId: customer.id,
      paymentMethod: input.paymentMethod,
      bankAccountId: input.bankAccountId,
      shippingMethod: input.shippingMethod,
      shippingFee: input.shippingFee,
      addressId: input.addressId,
      couponId: input.couponId,
      usedPoints: input.usedPoints,
      earnedPoints: input.earnedPoints,
      items: input.items,
      isPOS: false,
    })

    const primaryOrder = createdOrders[0]

    if (primaryOrder) {
      const customerName =
        customer.firstName && customer.lastName
          ? `${customer.firstName} ${customer.lastName}`
          : customer.user?.name || 'คุณลูกค้า'

      sendNewOrderNotificationEmail({
        storeId: store.id,
        storeName: store.name,
        orderNumber: primaryOrder.orderNumber,
        customerName,
        totalAmount: Number(primaryOrder.totalAmount),
        paymentMethod: primaryOrder.paymentMethod as PaymentMethod,
        items: primaryOrder.items.map((item) => ({
          title: item.title,
          quantity: item.quantity,
          price: Number(item.price),
        })),
      }).catch((err) => console.error(err))

      dispatchStoreWebhook(store.id, 'order.created', {
        orderId: primaryOrder.id,
        orderNumber: primaryOrder.orderNumber,
        status: primaryOrder.status,
        totalAmount: Number(primaryOrder.totalAmount),
        paymentMethod: primaryOrder.paymentMethod,
        paidAt: primaryOrder.paidAt,
        createdAt: primaryOrder.createdAt,
        customer: {
          name: customerName,
        },
        items: primaryOrder.items.map((item) => ({
          title: item.title,
          variantTitle: item.variantTitle,
          quantity: item.quantity,
          price: Number(item.price),
          customerNote: item.customerNote,
        })),
      }).catch((err) => console.error('Storefront order webhook error:', err))
    }

    return {
      success: true,
      messageTH: 'สั่งซื้อสินค้าสำเร็จแล้ว',
      messageEN: 'Order placed successfully',
      data: serializeDecimal(createdOrders[0]),
      allOrders: serializeDecimal(createdOrders),
    }
  } catch (error: unknown) {
    console.error(error)
    let errorMessage

    if (error instanceof Error) {
      errorMessage = error.message
    }

    return {
      success: false,
      messageTH: errorMessage || 'เกิดข้อผิดพลาดในการสั่งซื้อ',
      messageEN: errorMessage || 'Failed to place order',
    }
  }
}
