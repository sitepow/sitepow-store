'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'
import { DecimalToNumber, serializeDecimal } from '@/utils/decimal'

import { createLog } from '@/lib/activity-log'
import { auth } from '@/lib/auth'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

interface GetCustomersParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

const customerStoreSelect = {
  id: true,
  rewardPoints: true,
  totalSpent: true,
  customer: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      isBlocked: true,
      blockedUntil: true,
      fakeSlipCount: true,
      createdAt: true,
    },
  },
} satisfies Prisma.CustomerStoreSelect

export type GetCustomersItem = Prisma.CustomerStoreGetPayload<{
  select: typeof customerStoreSelect
}>

export interface GetCustomersResponse {
  data: DecimalToNumber<GetCustomersItem[]>
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getCustomers({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetCustomersParams): Promise<GetCustomersResponse> {
  const emptyResponse: GetCustomersResponse = {
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
    const whereClause: Prisma.CustomerStoreWhereInput = {}

    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canManageCustomers',
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
      whereClause.customer = {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search, mode: 'insensitive' } },
        ],
      }
    }

    const [totalItems, customerStores] = await Promise.all([
      prisma.customerStore.count({ where: whereClause }),
      prisma.customerStore.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { customer: { createdAt: 'desc' } },
        select: customerStoreSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: serializeDecimal(customerStores),
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

export async function unblockCustomer(customerId: string, storeId: string) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageCustomers',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'สิทธิ์การใช้งานไม่เพียงพอ' }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        isBlocked: false,
        fakeSlipCount: 0,
        blockedUntil: null,
      },
    })

    await createLog({
      action: LogAction.UNBLOCK_CUSTOMER,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Customer',
      entityId: updatedCustomer.id,
    })

    return { success: true, message: 'ปลดล็อกลูกค้าสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}

export async function blockCustomer(customerId: string, storeId: string) {
  try {
    const session = await auth()
    const userId = session?.user?.id
    if (!userId) {
      return { success: false, message: 'ไม่มีสิทธิ์เข้าถึง' }
    }

    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canManageCustomers',
    })

    if (!authCheck.isAuthorized) {
      return { success: false, message: 'สิทธิ์การใช้งานไม่เพียงพอ' }
    }

    const updatedCustomer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        isBlocked: true,
        blockedUntil: null,
      },
    })

    await createLog({
      action: LogAction.BLOCK_CUSTOMER,
      actorType: ActorType.MERCHANT,
      storeId,
      entity: 'Customer',
      entityId: updatedCustomer.id,
    })

    return { success: true, message: 'บล็อกลูกค้าสำเร็จ' }
  } catch (error) {
    console.error(error)
    return { success: false }
  }
}
