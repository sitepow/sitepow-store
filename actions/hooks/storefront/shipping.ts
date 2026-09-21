import { storefrontShippingKeys } from '@/actions/query-keys/storefront/shipping'
import { calculateMultiBranchShippingFee } from '@/actions/shipping'
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

export function useShippingCalculation(params: {
  storeId: string
  destinationProvince: string
  destinationPostcode: string
  groups: Array<{ branchId: string; province: string; weight: number }>
}) {
  return useQuery(
    queryOptions({
      queryKey: storefrontShippingKeys.calculation(params),
      queryFn: () => calculateMultiBranchShippingFee(params),
      enabled:
        !!params.storeId &&
        !!params.destinationPostcode &&
        params.groups.length > 0,
    }),
  )
}
