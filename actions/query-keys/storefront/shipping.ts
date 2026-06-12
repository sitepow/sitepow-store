export const storefrontShippingKeys = {
  all: ['shipping-storefront'] as const,
  options: (storeSlug: string) =>
    [...storefrontShippingKeys.all, 'options', storeSlug] as const,
}
