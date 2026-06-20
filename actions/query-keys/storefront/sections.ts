export const storefrontKeys = {
  all: ['storefront'] as const,
  categoriesProductsSections: (storeSlug: string) =>
    [...storefrontKeys.all, 'categories-products-sections', storeSlug] as const,
}
