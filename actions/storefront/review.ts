'use server'

import {
  SERVER_ERROR_MESSAGE_EN,
  SERVER_ERROR_MESSAGE_TH,
} from '@/constants/system'
import { OrderStatus, Prisma } from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'
import { getPathR2FromUrl } from '@/utils/image'
import { calculateReviewPoints } from '@/utils/review-points'

import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

import { invalidateStorefrontProductCache } from '../query-keys/storefront/invalidation/product'
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

export interface CreateReviewCategoryParam {
  label: string
  rating: number
}

export interface CreateCustomerReviewParams {
  storeId: string
  productId: string
  variantId: string
  orderId?: string
  rating: number
  comment?: string
  images?: string[]
  video?: string
  selectedOptions?: any
  categories?: CreateReviewCategoryParam[]
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

  const userSession = await getCurrentUser()
  const userId = userSession?.id

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
        limit,
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
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return {
      success: false,
      messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      messageEN: 'Please sign in to proceed',
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
    }
  }

  try {
    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (!customer) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลลูกค้าในระบบ',
        messageEN: 'Customer not found in the system',
        message: 'ไม่พบข้อมูลลูกค้าในระบบ',
      }
    }

    const {
      storeId,
      productId,
      variantId: inputVariantId,
      orderId,
      rating,
      comment,
      images = [],
      video,
      selectedOptions,
      categories,
    } = params

    if (!productId) {
      return {
        success: false,
        messageTH: 'ไม่พบรหัสสินค้าที่ถูกต้องในระบบ',
        messageEN: 'Invalid product ID in the system',
        message: 'ไม่พบรหัสสินค้าที่ถูกต้องในระบบ',
      }
    }

    let candidateVariantId = inputVariantId
    if (orderId) {
      const orderItem = await prisma.orderItem.findFirst({
        where: { orderId, productId },
        select: { variantId: true },
      })
      if (orderItem?.variantId) {
        candidateVariantId = orderItem.variantId
      }
    }

    let finalVariantId: string | null = null

    if (candidateVariantId) {
      const existingVariant = await prisma.productVariant.findUnique({
        where: { id: candidateVariantId },
        select: { id: true },
      })
      if (existingVariant) {
        finalVariantId = existingVariant.id
      }
    }

    if (!finalVariantId) {
      const fallbackVariant = await prisma.productVariant.findFirst({
        where: { productId },
        select: { id: true },
      })
      if (fallbackVariant) {
        finalVariantId = fallbackVariant.id
      }
    }

    if (orderId) {
      const existingReview = await prisma.review.findFirst({
        where: {
          customerId: customer.id,
          orderId,
          productId,
        },
      })

      if (existingReview) {
        return {
          success: false,
          messageTH: 'คุณได้ทำการรีวิวสินค้านี้ในคำสั่งซื้อนี้ไปแล้ว',
          messageEN: 'You have already reviewed this product for this order',
          message: 'คุณได้ทำการรีวิวสินค้านี้ในคำสั่งซื้อนี้ไปแล้ว',
        }
      }
    }

    const reviewConfig = await prisma.reviewRewardConfig.findUnique({
      where: { storeId },
    })

    let awardedPoints = 0
    let breakdown: { description: string; points: number }[] = []

    if (reviewConfig?.isEnabled) {
      const calculated = calculateReviewPoints({
        rating,
        comment: comment ?? '',
        images,
        video,
        config: reviewConfig,
      })
      awardedPoints = calculated.totalPoints
      breakdown = calculated.breakdown
    }

    const result = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          customerId: customer.id,
          storeId,
          productId,
          variantId: finalVariantId,
          orderId,
          rating,
          comment: comment ?? '',
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
        select: {
          id: true,
          rating: true,
          comment: true,
          images: true,
          video: true,
          date: true,
          customer: {
            select: {
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
          categories: true,
        },
      })

      if (awardedPoints > 0) {
        await tx.customerStore.upsert({
          where: {
            customerId_storeId: {
              customerId: customer.id,
              storeId,
            },
          },
          update: {
            rewardPoints: {
              increment: awardedPoints,
            },
          },
          create: {
            customerId: customer.id,
            storeId,
            rewardPoints: awardedPoints,
          },
        })
      }

      return { newReview, awardedPoints, breakdown }
    })

    const store = await prisma.store.findUnique({
      where: { id: storeId },
      select: { slug: true },
    })

    if (store?.slug) {
      await invalidateStorefrontProductCache(store.slug)
    }

    const successMsgTH =
      result.awardedPoints > 0
        ? `รีวิวสำเร็จ! คุณได้รับ ${result.awardedPoints} แต้มสะสม`
        : 'รีวิวสินค้าสำเร็จแล้ว'
    const successMsgEN =
      result.awardedPoints > 0
        ? `Review submitted successfully! You earned ${result.awardedPoints} points`
        : 'Product review submitted successfully'

    return {
      success: true,
      messageTH: successMsgTH,
      messageEN: successMsgEN,
      message: successMsgTH,
      data: serializeDecimal(result.newReview),
      pointsDetail: result.breakdown,
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}

export async function updateCustomerReview(
  reviewId: string,
  params: UpdateCustomerReviewParams,
) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return {
      success: false,
      messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      messageEN: 'Please sign in to proceed',
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
    }
  }

  try {
    const existingReview = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { customerId: true, storeId: true, images: true },
    })

    if (!existingReview) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลรีวิว',
        messageEN: 'Review not found',
        message: 'ไม่พบข้อมูลรีวิว',
      }
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
      return {
        success: false,
        messageTH: 'คุณไม่มีสิทธิ์แก้ไขรีวิวนี้',
        messageEN: 'You do not have permission to edit this review',
        message: 'คุณไม่มีสิทธิ์แก้ไขรีวิวนี้',
      }
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

    if (existingReview.storeId) {
      const store = await prisma.store.findUnique({
        where: { id: existingReview.storeId },
        select: { slug: true },
      })

      if (store?.slug) {
        await invalidateStorefrontProductCache(store.slug)
      }
    }

    return {
      success: true,
      messageTH: 'อัปเดตการรีวิวสินค้าสำเร็จแล้ว',
      messageEN: 'Product review updated successfully',
      message: 'อัพเดตการรีวิวสินค้าสำเร็จแล้ว',
      data: serializeDecimal(updatedReview),
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}

export async function getPurchasableProductsForReview(storeSlug?: string) {
  const userSession = await getCurrentUser()
  const userId = userSession?.id
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
        ...(storeSlug && {
          store: {
            OR: [
              { slug: storeSlug },
              { customDomain: storeSlug, customDomainStatus: 'ACTIVE' },
              {
                StoreDomain: { some: { domain: storeSlug, status: 'ACTIVE' } },
              },
            ],
          },
        }),
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
          (r) => r.orderId === order.id && r.productId === item.productId,
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
          comment: existingReview?.comment ?? '',
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
  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId) {
    return {
      success: false,
      messageTH: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
      messageEN: 'Please sign in to proceed',
      message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ',
    }
  }

  try {
    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      select: { customerId: true, storeId: true, images: true },
    })

    if (!review) {
      return {
        success: false,
        messageTH: 'ไม่พบข้อมูลรีวิว',
        messageEN: 'Review not found',
        message: 'ไม่พบข้อมูลรีวิว',
      }
    }

    const customer = await prisma.customer.findUnique({
      where: { userId },
      select: { id: true },
    })

    if (customer && review.customerId === customer.id) {
      return {
        success: false,
        messageTH: 'ไม่อนุญาตให้ลบรีวิว คุณสามารถแก้ไขรีวิวได้เท่านั้น',
        messageEN:
          'Deleting reviews is not allowed. You can only edit your review.',
        message: 'ไม่อนุญาตให้ลบรีวิว คุณสามารถแก้ไขรีวิวได้เท่านั้น',
      }
    }

    let isAuthorized = false
    if (review.storeId) {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId: review.storeId,
        permission: 'canDeleteReviews',
      })
      isAuthorized = authCheck.isAuthorized
    }

    if (!isAuthorized) {
      return {
        success: false,
        messageTH: 'คุณไม่มีสิทธิ์ลบรีวิวนี้',
        messageEN: 'You do not have permission to delete this review',
        message: 'คุณไม่มีสิทธิ์ลบรีวิวนี้',
      }
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

    if (review.storeId) {
      const store = await prisma.store.findUnique({
        where: { id: review.storeId },
        select: { slug: true },
      })

      if (store?.slug) {
        await invalidateStorefrontProductCache(store.slug)
      }
    }

    return {
      success: true,
      messageTH: 'ลบรีวิวสำเร็จ',
      messageEN: 'Review deleted successfully',
      message: 'ลบรีวิวสำเร็จ',
    }
  } catch (error) {
    console.error(error)
    return {
      success: false,
      messageTH: SERVER_ERROR_MESSAGE_TH,
      messageEN: SERVER_ERROR_MESSAGE_EN,
      message: SERVER_ERROR_MESSAGE_TH,
    }
  }
}
