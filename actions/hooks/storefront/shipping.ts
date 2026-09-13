import { storefrontShippingKeys } from '@/actions/query-keys/storefront/shipping'
import { calculateMultiBranchShippingFee } from '@/actions/shipping'
import { getStorefrontShippingOptions } from '@/actions/storefront/shipping'
import { CountryCode } from '@/generated/prisma/enums'
import { queryOptions, useQuery } from '@tanstack/react-query'

export function useStorefrontShippingOptions(
  storeSlug: string,
  country: CountryCode = CountryCode.TH,
) {
  return useQuery(
    queryOptions({
      queryKey: [...storefrontShippingKeys.options(storeSlug), country],
      queryFn: () => getStorefrontShippingOptions(storeSlug, country),
      enabled: !!storeSlug,
    }),
  )
}

export function useShippingCalculation(params: {
  storeId: string
  destinationCountry?: CountryCode
  destinationProvince: string
  destinationPostcode: string
  groups: Array<{ branchId: string; province: string; weight: number }>
}) {
  const isInternational =
    params.destinationCountry && params.destinationCountry !== CountryCode.TH

  return useQuery(
    queryOptions({
      queryKey: storefrontShippingKeys.calculation(params),
      queryFn: () => calculateMultiBranchShippingFee(params),
      enabled:
        !!params.storeId &&
        (isInternational || !!params.destinationPostcode) &&
        params.groups.length > 0,
    }),
  )
}
