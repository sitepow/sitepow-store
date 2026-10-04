export const storefrontDiscountKeys = {
  all: ['storefront', 'discount'] as const,
  loyalty: (storeSlug: string) =>
    [...storefrontDiscountKeys.all, 'loyalty', storeSlug] as const,
}
