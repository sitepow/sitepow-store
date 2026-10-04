import { getAnalyticsOverview } from '@/actions/analytics/analytics/actions'
import { ALL_STORES } from '@/stores/use-store-filter'
import { useQuery } from '@tanstack/react-query'

import { analyticsKeys } from '@/actions/analytics/analytics/query-keys'

export function useAnalyticsOverview(
  storeId: string,
  branchId?: string,
  startDate?: string,
  endDate?: string,
) {
  return useQuery({
    queryKey: analyticsKeys.overview(storeId, branchId, startDate, endDate),
    queryFn: () => getAnalyticsOverview(storeId, branchId, startDate, endDate),
    enabled: !!storeId && storeId !== ALL_STORES,
  })
}
