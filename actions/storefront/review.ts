'use server'

import { Prisma } from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export interface CreateCustomerReviewParams {
  storeId: string
  productId: string
  variantId: string
  orderId?: string
  rating: number
  comment: string
  images?: string[]
  video?: string
  selectedOptions?: Prisma.InputJsonValue
  categories?: {
    label: string
    rating: number
  }[]
}

export interface GetCustomerReviewsParams {
  page?: number
  limit?: number
}

const customerReviewSelect = {
  id: true,
  rating: true,
  comment: true,
  images: true,
  video: true,
  date: true,
  selectedOptions: true,
  orderId: true,
  productId: true,
  variantId: true,
  storeId: true,
  product: {
    select: {
      id: true,
      title: true,
      images: {
        select: {
          url: true,
          isPrimary: true,
        },
      },
    },
  },
  categories: {
    select: {
      id: true,
      label: true,
      rating: true,
    },
  },
} satisfies Prisma.ReviewSelect

export type CustomerReviewItem = Prisma.ReviewGetPayload<{
  select: typeof customerReviewSelect
}>

export interface GetCustomerReviewsResponse {
  data: DecimalToNumber<CustomerReviewItem[]>
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getCustomerReviews({
  page = 1,
  limit = 10,
}: GetCustomerReviewsParams = {}): Promise<GetCustomerReviewsResponse> {
  const emptyResponse: GetCustomerReviewsResponse = {
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
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!customer) {
      return emptyResponse
    }

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.ReviewWhereInput = {
      customerId: customer.id,
    }

    const [totalItems, reviews] = await Promise.all([
      prisma.review.count({ where: whereClause }),
      prisma.review.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { date: 'desc' },
        select: customerReviewSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(reviews),
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

export async function createCustomerReview(params: CreateCustomerReviewParams) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, error: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!customer) {
      return { success: false, error: 'ไม่พบข้อมูลลูกค้าในระบบ' }
    }

    const {
      storeId,
      productId,
      variantId,
      orderId,
      rating,
      comment,
      images = [],
      video,
      selectedOptions,
      categories,
    } = params

    if (!storeId || !productId || !variantId) {
      return {
        success: false,
        error: 'ข้อมูลไม่ครบถ้วน (ขาด storeId, productId หรือ variantId)',
      }
    }

    if (!rating || rating < 1 || rating > 5) {
      return { success: false, error: 'คะแนนต้องอยู่ระหว่าง 1 ถึง 5 ดาว' }
    }

    if (!comment || comment.trim() === '') {
      return { success: false, error: 'กรุณากรอกความคิดเห็น' }
    }

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { customerId: true, storeId: true },
      })

      if (!order || order.customerId !== customer.id) {
        return {
          success: false,
          error: 'คำสั่งซื้อไม่ถูกต้อง หรือคุณไม่ใช่เจ้าของคำสั่งซื้อนี้',
        }
      }
    }

    const newReview = await prisma.review.create({
      data: {
        customerId: customer.id,
        storeId,
        productId,
        variantId,
        orderId,
        rating,
        comment,
        images,
        video,
        selectedOptions: selectedOptions ?? Prisma.JsonNull,
        categories:
          categories && categories.length > 0
            ? {
                createMany: {
                  data: categories.map((cat) => ({
                    label: cat.label,
                    rating: cat.rating,
                  })),
                },
              }
            : undefined,
      },
      select: customerReviewSelect,
    })

    return {
      success: true,
      data: serializeDecimal(newReview),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
