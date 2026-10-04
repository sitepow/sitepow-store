import { queryOptions, useQuery } from '@tanstack/react-query'

import { storefrontDashboardKeys } from '@/actions/storefront/dashboard/query-keys'
import { getStorefrontDashboard } from '@/actions/storefront/dashboard/actions'

export function useStorefrontDashboard(storeSlug: string) {
  return useQuery(
    queryOptions({
      queryKey: storefrontDashboardKeys.detail(storeSlug),
      queryFn: async () => await getStorefrontDashboard(storeSlug),
      enabled: !!storeSlug,
    }),
  )
}
