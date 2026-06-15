import { queryOptions, useMutation, useQuery } from '@tanstack/react-query'

import { storefrontDiscountKeys } from '../../query-keys/storefront/discount'
import { getStorefrontLoyalty, validateCoupon } from '../../storefront/discount'

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
