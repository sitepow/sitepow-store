import { queryOptions, useQuery } from '@tanstack/react-query'

import { getDashboard } from '@/actions/analytics/dashboard/actions'
import { dashboardKeys } from '@/actions/analytics/dashboard/query-keys'

export function useDashboard(storeId: string, branchId: string) {
  return useQuery(
    queryOptions({
      queryKey: dashboardKeys.detail(storeId, branchId),
      queryFn: async () => await getDashboard(storeId, branchId),
      enabled: !!storeId || !!branchId,
    }),
  )
}
