import { queryOptions, useQuery } from '@tanstack/react-query'

import { storefrontDashboardKeys } from '../../query-keys/storefront/dashboard'
import { getStorefrontDashboard } from '../../storefront/dashboard'

export function useStorefrontDashboard(storeSlug: string) {
  return useQuery(
    queryOptions({
      queryKey: storefrontDashboardKeys.detail(storeSlug),
      queryFn: async () => await getStorefrontDashboard(storeSlug),
      enabled: !!storeSlug,
    }),
  )
}
