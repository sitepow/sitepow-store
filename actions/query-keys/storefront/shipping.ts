export const storefrontShippingKeys = {
  all: ['shipping-storefront'] as const,
  options: (storeSlug: string) =>
    [...storefrontShippingKeys.all, 'options', storeSlug] as const,
  calculation: (params: {
    storeId: string
    originProvince: string
    destinationProvince: string
    destinationPostcode: string
    weight: number
  }) => [...storefrontShippingKeys.all, 'calc', params] as const,
}
