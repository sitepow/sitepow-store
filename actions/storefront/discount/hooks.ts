import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'

import { storefrontDiscountKeys } from '@/actions/storefront/discount/query-keys'
import { getStorefrontLoyalty, validateCoupon } from '@/actions/storefront/discount/actions'

export function useStorefrontLoyalty(storeSlug: string) {
  return useQuery(
    queryOptions({
      queryKey: storefrontDiscountKeys.loyalty(storeSlug),
      queryFn: async () => await getStorefrontLoyalty(storeSlug),
      enabled: !!storeSlug,
    }),
  )
}

export function useValidateCoupon() {
  return useMutation({
    mutationFn: validateCoupon,
  })
}
