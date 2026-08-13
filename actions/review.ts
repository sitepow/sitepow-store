'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

interface GetReviewsParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

export interface CreateReviewInput {
  storeId: string
  productId: string
  variantId: string
  customerId: string
  orderId?: string | null
  rating: number
  comment: string
  images?: string[]
  video?: string | null
  selectedOptions?: Prisma.InputJsonValue
}

export interface UpdateReviewInput {
  rating?: number
  comment?: string
  images?: string[]
  video?: string | null
  selectedOptions?: Prisma.InputJsonValue
}

const reviewSelect = {
  id: true,
  rating: true,
  comment: true,
  images: true,
  video: true,
  date: true,
  storeId: true,
  productId: true,
  variantId: true,
  product: {
    select: {
      id: true,
      title: true,
    },
  },
  customerId: true,
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      avatar: true,
    },
  },
  orderId: true,
  selectedOptions: true,
  categories: {
    select: {
      id: true,
      label: true,
      rating: true,
    },
  },
} satisfies Prisma.ReviewSelect

export type GetReviewItem = Prisma.ReviewGetPayload<{
  select: typeof reviewSelect
}>

export interface GetReviewsResponse {
  data: DecimalToNumber<GetReviewItem[]>
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getReviews({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetReviewsParams): Promise<GetReviewsResponse> {
  const emptyResponse: GetReviewsResponse = {
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
    const whereClause: Prisma.ReviewWhereInput = {}

    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canViewReviews',
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

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    if (search) {
      whereClause.OR = [
        { comment: { contains: search, mode: 'insensitive' } },
        { product: { title: { contains: search, mode: 'insensitive' } } },
        { customer: { firstName: { contains: search, mode: 'insensitive' } } },
        { customer: { lastName: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [totalItems, reviews] = await Promise.all([
      prisma.review.count({ where: whereClause }),
      prisma.review.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { date: 'desc' },
        select: reviewSelect,
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

export async function createReview(input: CreateReviewInput) {
  try {
    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const review = await prisma.review.create({
      data: {
        storeId: input.storeId,
        productId: input.productId,
        variantId: input.variantId,
        customerId: input.customerId,
        orderId: input.orderId,
        rating: input.rating,
        comment: input.comment,
        images: input.images || [],
        video: input.video,
        selectedOptions: input.selectedOptions ?? Prisma.JsonNull,
      },
      select: reviewSelect,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: input.storeId,
      entity: 'Review',
      entityId: review.id,
      details: {
        productId: input.productId,
        rating: input.rating,
        type: 'created',
      },
    })

    return {
      success: true,
      message: 'สร้างรีวิวสำเร็จ',
      data: serializeDecimal(review),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function updateReview(id: string, input: UpdateReviewInput) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Review ID' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const existingReview = await prisma.review.findUnique({
      where: { id },
      select: { storeId: true },
    })

    if (!existingReview) {
      return { success: false, message: 'ไม่พบข้อมูลรีวิว' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: existingReview.storeId,
      permission: 'canUpdateReviews',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const updated = await prisma.review.update({
      where: { id },
      data: {
        ...input,
        selectedOptions: input.selectedOptions ?? undefined,
      },
      select: reviewSelect,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: updated.storeId,
      entity: 'Review',
      entityId: id,
      details: { updatedFields: Object.keys(input), type: 'updated' },
    })

    return {
      success: true,
      message: 'อัปเดตรีวิวสำเร็จ',
      data: serializeDecimal(updated),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function deleteReview(id: string) {
  try {
    if (!id) {
      return { success: false, message: 'ไม่พบ Review ID' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const review = await prisma.review.findUnique({
      where: { id },
      select: { storeId: true },
    })

    if (!review) {
      return { success: false, message: 'ไม่พบข้อมูลรีวิว' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId: review.storeId,
      permission: 'canDeleteReviews',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    await prisma.review.delete({ where: { id } })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId: review.storeId,
      entity: 'Review',
      entityId: id,
      details: { type: 'deleted' },
    })

    return { success: true, message: 'ลบรีวิวสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
