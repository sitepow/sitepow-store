import { ActorType, LogAction } from '@/generated/prisma/enums'
import { queryOptions, useQuery } from '@tanstack/react-query'

import { getActivityLogs } from '../activity-log'
import { activityLogKeys } from '../query-keys/activity-log'

export function useActivityLogs({
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
}) {
  const filters = { storeId, action, actorType, search, page, limit }

  return useQuery(
    queryOptions({
      queryKey: activityLogKeys.list(filters),
      queryFn: async () => await getActivityLogs(filters),
      enabled: !!storeId,
      placeholderData: (previousData) => previousData,
    }),
  )
}
