'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'
import { ALL_STORES } from '@/stores/merchant/use-store-filter'

import { getCurrentUser } from '@/lib/auth/server'
import { verifyEmployeePermission } from '@/lib/auth/permission'
import { prisma } from '@/lib/db/prisma'

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
      id: true,
      name: true,
      email: true,
    },
  },
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
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

export interface ActivityLogStats {
  totalCount: number
  todayCount: number
  topAction: LogAction | null
  activeActorsCount: number
}

export async function getActivityLogs({
  storeId,
  action,
  actions,
  actorType,
  search,
  page = 1,
  limit = 10,
}: {
  storeId: string
  action?: LogAction
  actions?: LogAction[]
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
    } else if (actions && actions.length > 0) {
      whereClause.action = { in: actions }
    }

    if (actorType) {
      whereClause.actorType = actorType
    }

    if (search) {
      whereClause.OR = [
        { entityId: { contains: search, mode: 'insensitive' } },
        { entity: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } },
        { employee: { name: { contains: search, mode: 'insensitive' } } },
        { employee: { email: { contains: search, mode: 'insensitive' } } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const sanitizedPage = Math.max(1, page || 1)
    const sanitizedLimit = Math.max(1, Math.min(50, limit || 10))
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

export async function getActivityLogStats(
  storeId: string,
): Promise<ActivityLogStats> {
  const emptyStats: ActivityLogStats = {
    totalCount: 0,
    todayCount: 0,
    topAction: null,
    activeActorsCount: 0,
  }

  const userSession = await getCurrentUser()
  const userId = userSession?.id

  if (!userId || !storeId || storeId === ALL_STORES) {
    return emptyStats
  }

  try {
    const authCheck = await verifyEmployeePermission({
      userId,
      storeId,
      permission: 'canViewActivityLogs',
    })

    if (!authCheck.isAuthorized) {
      return emptyStats
    }

    const startOfToday = new Date()
    startOfToday.setHours(0, 0, 0, 0)

    const [totalCount, todayCount, topActions, uniqueActors] =
      await Promise.all([
        prisma.activityLog.count({ where: { storeId } }),
        prisma.activityLog.count({
          where: { storeId, createdAt: { gte: startOfToday } },
        }),
        prisma.activityLog.groupBy({
          by: ['action'],
          where: { storeId },
          _count: { action: true },
          orderBy: { _count: { action: 'desc' } },
          take: 1,
        }),
        prisma.activityLog.findMany({
          where: { storeId },
          distinct: ['userId', 'employeeId'],
          select: { id: true },
        }),
      ])

    return {
      totalCount,
      todayCount,
      topAction: topActions[0]?.action ?? null,
      activeActorsCount: uniqueActors.length,
    }
  } catch (error) {
    console.error(error)
    return emptyStats
  }
}

