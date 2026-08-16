'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

const loyaltySettingsSelect = {
  id: true,
  isPointsEnabled: true,
  pointEarningRate: true,
  pointRedeemRate: true,
} satisfies Prisma.StoreSelect

export type LoyaltySettings = Prisma.StoreGetPayload<{
  select: typeof loyaltySettingsSelect
}>

const customerPointsSelect = {
  id: true,
  totalSpent: true,
  rewardPoints: true,
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      phone: true,
      email: true,
    },
  },
} satisfies Prisma.CustomerStoreSelect

export type GetCustomerPointsItem = Prisma.CustomerStoreGetPayload<{
  select: typeof customerPointsSelect
}>

export interface GetCustomerPointsResponse {
  data: DecimalToNumber<GetCustomerPointsItem[]>
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export interface UpdateLoyaltySettingsInput {
  isPointsEnabled: boolean
  pointEarningRate?: number | null
  pointRedeemRate?: number | null
}

export async function getLoyaltySettings(storeId: string) {
  try {
    if (!storeId) {
      return null
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return null
    }

    const data = await prisma.store.findUnique({
      where: { id: storeId },
      select: loyaltySettingsSelect,
    })

    return serializeDecimal(data)
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function updateLoyaltySettings(
  storeId: string,
  input: UpdateLoyaltySettingsInput,
) {
  try {
    if (!storeId) {
      return { success: false, message: 'ไม่พบ Store ID' }
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return { success: false, message: 'กรุณาเข้าสู่ระบบก่อนทำรายการ' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canUpdateStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return {
        success: false,
        message: authCheck.message || 'สิทธิ์การใช้งานของคุณไม่เพียงพอ',
      }
    }

    const data = await prisma.store.update({
      where: { id: storeId },
      data: input,
      select: loyaltySettingsSelect,
    })

    await createLog({
      action: LogAction.UPDATE_STORE_SETTING,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Store',
      entityId: storeId,
      details: { setting: 'loyalty', updatedFields: Object.keys(input) },
    })

    return {
      success: true,
      message: 'ตั้งค่าสำเร็จแล้ว',
      data: serializeDecimal(data),
    }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function getCustomerPoints({
  storeId,
  page = 1,
  limit = 10,
  search,
}: {
  storeId: string
  page?: number
  limit?: number
  search?: string
}) {
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
    if (!storeId) {
      return empty
    }

    const session = await auth()
    const userId = session?.user?.id

    if (!userId) {
      return empty
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewStoreSettings',
    })

    if (!authCheck.isAuthorized) {
      return empty
    }

    const sanitizedPage = Math.max(1, page)
    const sanitizedLimit = Math.max(1, Math.min(20, limit))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.CustomerStoreWhereInput = { storeId }

    if (search) {
      whereClause.customer = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    const [totalItems, customers] = await Promise.all([
      prisma.customerStore.count({ where: whereClause }),
      prisma.customerStore.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { rewardPoints: 'desc' },
        select: customerPointsSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(customers),
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
