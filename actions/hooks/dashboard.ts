import { queryOptions, useQuery } from '@tanstack/react-query'

import { getDashboard } from '../dashboard'
import { dashboardKeys } from '../query-keys/dashboard'

export function useDashboard(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: dashboardKeys.detail(storeId),
      queryFn: async () => await getDashboard(storeId),
      enabled: !!storeId,
    }),
  )
}
