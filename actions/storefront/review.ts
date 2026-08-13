'use server'

import { OrderStatus, Prisma } from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import { getPathR2FromUrl } from '@/utils/image'

import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

import { r2DeleteImage } from '../r2'

export interface PurchasableItem {
  orderId: string
  orderNumber: string
  storeId: string
  productId: string
  variantId: string
  productTitle: string
  productImage?: string
  reviewId?: string
  rating?: number
  comment?: string
  reviewImages?: string[]
  reviewDate?: string
}

export interface UpdateCustomerReviewParams {
  rating?: number
  comment?: string
  images?: string[]
  video?: string
  selectedOptions?: Prisma.InputJsonValue
}

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
    return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!customer) {
      return { success: false, message: 'ไม่พบข้อมูลลูกค้าในระบบ' }
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
      return { success: false, message: 'คะแนนต้องอยู่ระหว่าง 1 ถึง 5 ดาว' }
    }

    if (!comment || comment.trim() === '') {
      return { success: false, message: 'กรุณากรอกความคิดเห็น' }
    }

    if (orderId) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { customerId: true, storeId: true, status: true },
      })

      if (!order || order.customerId !== customer.id) {
        return {
          success: false,
          error: 'คำสั่งซื้อไม่ถูกต้อง หรือคุณไม่ใช่เจ้าของคำสั่งซื้อนี้',
        }
      }

      if (order.status !== 'SHIPPED') {
        return {
          success: false,
          error: 'สามารถเขียนรีวิวได้เฉพาะสินค้าที่จัดส่งสำเร็จแล้วเท่านั้น',
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
      message: 'รีวิวสินค้าสำเร็จแล้ว',
      data: serializeDecimal(newReview),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateCustomerReview(
  reviewId: string,
  params: UpdateCustomerReviewParams,
) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
  }

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { customerId: true, storeId: true, images: true },
    })

    if (!existingReview) {
      return { success: false, message: 'ไม่พบข้อมูลรีวิว' }
    }

    let isAuthorized = false

    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (customer && existingReview.customerId === customer.id) {
      isAuthorized = true
    } else if (existingReview.storeId) {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId: existingReview.storeId,
        permission: 'canUpdateReviews',
      })
      isAuthorized = authCheck.isAuthorized
    }

    if (!isAuthorized) {
      return { success: false, message: 'คุณไม่มีสิทธิ์แก้ไขรีวิวนี้' }
    }

    if (params.images !== undefined) {
      const oldImageUrls = existingReview.images || []
      const newImageUrls = params.images

      const urlsToDelete = oldImageUrls.filter(
        (url) => !newImageUrls.includes(url),
      )

      if (urlsToDelete.length > 0) {
        await Promise.all(
          urlsToDelete.map(async (url) => {
            const key = getPathR2FromUrl(url)
            if (key) {
              await r2DeleteImage(key)
            }
          }),
        )
      }
    }

    const updatedReview = await prisma.review.update({
      where: { id: reviewId },
      data: {
        ...(params.rating !== undefined && { rating: params.rating }),
        ...(params.comment !== undefined && { comment: params.comment }),
        ...(params.images !== undefined && { images: params.images }),
        ...(params.video !== undefined && { video: params.video }),
        ...(params.selectedOptions !== undefined && {
          selectedOptions: params.selectedOptions ?? Prisma.JsonNull,
        }),
      },
      select: customerReviewSelect,
    })

    return {
      success: true,
      message: 'อัพเดตการรีวิวสินค้าสำเร็จแล้ว',
      data: serializeDecimal(updatedReview),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function getPurchasableProductsForReview() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) {
    return { success: false, data: [] }
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (!customer) {
      return { success: false, data: [] }
    }

    const orders = await prisma.order.findMany({
      where: {
        customerId: customer.id,
        status: OrderStatus.SHIPPED,
      },
      include: {
        items: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const allOrderIds = orders.map((o) => o.id)

    const reviews = await prisma.review.findMany({
      where: {
        customerId: customer.id,
        orderId: { in: allOrderIds },
      },
    })

    const result: PurchasableItem[] = []

    for (const order of orders) {
      for (const item of order.items) {
        const existingReview = reviews.find(
          (r) =>
            r.orderId === order.id &&
            r.productId === item.productId &&
            r.variantId === item.variantId,
        )

        result.push({
          orderId: order.id,
          orderNumber: order.orderNumber,
          storeId: order.storeId,
          productId: item.productId,
          variantId: item.variantId,
          productTitle: item.title,
          productImage: item.image || undefined,
          reviewId: existingReview?.id,
          rating: existingReview?.rating,
          comment: existingReview?.comment,
          reviewImages: existingReview?.images,
          reviewDate: existingReview?.date
            ? existingReview.date.toISOString()
            : undefined,
        })
      }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error(error)
    return { success: false, data: [] }
  }
}

export async function deleteCustomerReview(reviewId: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { customerId: true, storeId: true, images: true },
    })

    if (!review) {
      return { success: false, message: 'ไม่พบข้อมูลรีวิว' }
    }

    let isAuthorized = false

    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (customer && review.customerId === customer.id) {
      isAuthorized = true
    } else if (review.storeId) {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId: review.storeId,
        permission: 'canDeleteReviews',
      })
      isAuthorized = authCheck.isAuthorized
    }

    if (!isAuthorized) {
      return { success: false, message: 'คุณไม่มีสิทธิ์ลบรีวิวนี้' }
    }

    if (review.images && review.images.length > 0) {
      await Promise.all(
        review.images.map(async (url) => {
          const key = getPathR2FromUrl(url)
          if (key) {
            await r2DeleteImage(key)
          }
        }),
      )
    }

    await prisma.review.delete({
      where: { id: reviewId },
    })

    return { success: true, message: 'ลบรีวิวสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
