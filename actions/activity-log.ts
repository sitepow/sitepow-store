'use server'

import { ActorType, LogAction, Prisma } from '@/generated/prisma/client'

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
  staff: {
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

  try {
    const sanitizedPage = Math.max(1, page || 1)
    const sanitizedLimit = Math.max(1, Math.min(20, limit || 10))
    const skip = (sanitizedPage - 1) * sanitizedLimit

    const whereClause: Prisma.ActivityLogWhereInput = {
      storeId,
      ...(action ? { action } : {}),
      ...(actorType ? { actorType } : {}),
      ...(search
        ? {
            OR: [
              { entityId: { contains: search, mode: 'insensitive' } },
              { entity: { contains: search, mode: 'insensitive' } },
              { staff: { name: { contains: search, mode: 'insensitive' } } },
              { user: { name: { contains: search, mode: 'insensitive' } } },
            ],
          }
        : {}),
    }

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
    console.error('Error fetching activity logs:', error)
    return emptyResponse
  }
}
