import { ActorType, LogAction } from '@/generated/prisma/enums'
import { queryOptions, useQuery } from '@tanstack/react-query'

import {
  getActivityLogs,
  getActivityLogStats,
} from '@/actions/analytics/activity-log/actions'
import { activityLogKeys } from '@/actions/analytics/activity-log/query-keys'

export function useActivityLogs({
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
}) {
  const filters = { storeId, action, actions, actorType, search, page, limit }

  return useQuery(
    queryOptions({
      queryKey: activityLogKeys.list(filters),
      queryFn: async () => await getActivityLogs(filters),
      enabled: !!storeId,
      placeholderData: (previousData) => previousData,
    }),
  )
}

export function useActivityLogStats(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: activityLogKeys.stats(storeId),
      queryFn: async () => await getActivityLogStats(storeId),
      enabled: !!storeId,
      staleTime: 30_000,
    }),
  )
}

