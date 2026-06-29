export const storefrontSectionsKeys = {
  all: ['storefront'] as const,
  categoriesProductsSections: (storeSlug: string) =>
    [
      ...storefrontSectionsKeys.all,
      'categories-products-sections',
      storeSlug,
    ] as const,
}
