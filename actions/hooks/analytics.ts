import { getAnalyticsOverview } from '@/actions/analytics'
import { queryOptions, useQuery } from '@tanstack/react-query'

import { analyticsKeys } from '../query-keys/analytics'

export function useAnalyticsOverview(storeId: string, branchId?: string) {
  return useQuery(
    queryOptions({
      queryKey: analyticsKeys.overview(storeId, branchId),
      queryFn: async () => await getAnalyticsOverview(storeId, branchId),
      enabled: !!storeId && storeId !== 'ALL_STORES',
    }),
  )
}
