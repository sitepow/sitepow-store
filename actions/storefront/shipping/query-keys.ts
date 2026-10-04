export const storefrontShippingKeys = {
  all: ['shipping-storefront'] as const,
  options: (storeSlug: string) =>
    [...storefrontShippingKeys.all, 'options', storeSlug] as const,
  calculation: (params: {
    storeId: string
    destinationProvince: string
    destinationPostcode: string
    groups: Array<{ branchId: string; province: string; weight: number }>
  }) => [...storefrontShippingKeys.all, 'calc', params] as const,
}
