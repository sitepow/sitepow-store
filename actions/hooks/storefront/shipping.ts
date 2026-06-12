import { storefrontShippingKeys } from '@/actions/query-keys/storefront/shipping'
import { getStorefrontShippingOptions } from '@/actions/storefront/shipping'
import { queryOptions, useQuery } from '@tanstack/react-query'

export function useStorefrontShippingOptions(storeSlug: string) {
  return useQuery(
    queryOptions({
      queryKey: storefrontShippingKeys.options(storeSlug),
      queryFn: () => getStorefrontShippingOptions(storeSlug),
      enabled: !!storeSlug,
    }),
  )
}
