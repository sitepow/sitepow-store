import { storefrontPaymentKeys } from '@/actions/query-keys/storefront/payment'
import { getStorefrontPaymentOptions } from '@/actions/storefront/payment'
import { queryOptions, useQuery } from '@tanstack/react-query'

export function useStorefrontPaymentOptions(storeSlug: string) {
  return useQuery(
    queryOptions({
      queryKey: storefrontPaymentKeys.storefrontOptions(storeSlug),
      queryFn: () => getStorefrontPaymentOptions(storeSlug),
      enabled: !!storeSlug,
    }),
  )
}
