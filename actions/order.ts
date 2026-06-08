'use server'

import { Prisma } from '@/generated/prisma/client'
import { OrderStatus } from '@/generated/prisma/enums'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

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
  deliveryStatus: true,
  paymentMethod: true,
  shippingMethod: true,
  trackingNumber: true,
  createdAt: true,
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
    },
  },
  guestName: true,
  guestEmail: true,
  guestPhone: true,
  branch: {
    select: {
      id: true,
      name: true,
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
  data: DecimalToNumber<GetOrdersItem[]>
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
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
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
  } catch {
    return {
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
  }
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  if (!id) {
    throw new Error('ไม่พบ Order ID')
  }

  await prisma.order.update({
    where: { id },
    data: { status },
  })

  return { message: 'อัปเดตสถานะออเดอร์สำเร็จ' }
}
