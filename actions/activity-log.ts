'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/use-store-filter'

import { getCurrentUser } from '@/lib/auth-server'
import { verifyEmployeePermission } from '@/lib/permission'
import { prisma } from '@/lib/prisma'

const activityLogSelect = {
  id: true,
  action: true,
  actorType: true,
  entity: true,
  entityId: true,
  ipAddress: true,
  details: true,
  createdAt: true,
  storeId: true,
  employee: {
    select: {
      name: true,
    },
  },
  user: {
    select: {
      name: true,
    },
  },
} satisfies Prisma.ActivityLogSelect

export type GetActivityLogItem = Prisma.ActivityLogGetPayload<{
  select: typeof activityLogSelect
}>

export interface GetActivityLogsResponse {
  data: GetActivityLogItem[]
  meta: {
    currentPage: number
    limit: number
    totalItems: number
    totalPages: number
    hasNextPage: boolean
    hasPreviousPage: boolean
  }
}

export async function getActivityLogs({
  storeId,
  action,
  actorType,
  search,
  page = 1,
  limit = 10,
}: {
  storeId: string
  action?: LogAction
  actorType?: ActorType
  search?: string
  page?: number
  limit?: number
}): Promise<GetActivityLogsResponse> {
  const emptyResponse: GetActivityLogsResponse = {
    data: [],
    meta: {
      currentPage: page || 1,
      limit: limit || 10,
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
    const whereClause: Prisma.ActivityLogWhereInput = {}

    if (storeId && storeId !== ALL_STORES && storeId !== '') {
      const authCheck = await verifyEmployeePermission({
        userId,
        storeId,
        permission: 'canViewActivityLogs',
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

    if (action) {
      whereClause.action = action
    }

    if (actorType) {
      whereClause.actorType = actorType
    }

    if (search) {
      whereClause.OR = [
        { entityId: { contains: search, mode: 'insensitive' } },
        { entity: { contains: search, mode: 'insensitive' } },
        { employee: { name: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const sanitizedPage = Math.max(1, page || 1)
    const sanitizedLimit = Math.max(1, Math.min(20, limit || 10))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const [totalItems, logs] = await Promise.all([
      prisma.activityLog.count({ where: whereClause }),
      prisma.activityLog.findMany({
        where: whereClause,
        skip,
        take: sanitizedLimit,
        orderBy: { createdAt: 'desc' },
        select: activityLogSelect,
      }),
    ])

    const totalPages = Math.ceil(totalItems / sanitizedLimit)

    return {
      data: logs,
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
