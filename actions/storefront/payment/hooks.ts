import { storefrontPaymentKeys } from '@/actions/storefront/payment/query-keys'
import { getStorefrontPaymentOptions } from '@/actions/storefront/payment/actions'
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
