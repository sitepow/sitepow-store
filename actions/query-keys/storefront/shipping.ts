export const storefrontShippingKeys = {
  all: ['shipping-storefront'] as const,
  options: (storeSlug: string, country?: string) =>
    [...storefrontShippingKeys.all, 'options', storeSlug, country] as const,
  calculation: (params: {
    storeId: string
    destinationCountry?: string
    destinationProvince: string
    destinationPostcode: string
    groups: Array<{ branchId: string; province: string; weight: number }>
  }) => [...storefrontShippingKeys.all, 'calc', params] as const,
}
