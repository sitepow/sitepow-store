export const storefrontProductKeys = {
  all: ['storefront', 'products'] as const,
  lists: () => [...storefrontProductKeys.all, 'list'] as const,
  list: (filters: {
    storeSlug: string
    page?: number
    limit?: number
    search?: string
    categorySlug?: string
  }) => [...storefrontProductKeys.lists(), filters] as const,
  details: () => [...storefrontProductKeys.all, 'detail'] as const,
  detail: (storeSlug: string, productSlug: string) =>
    [...storefrontProductKeys.all, 'detail', storeSlug, productSlug] as const,
  related: () => [...storefrontProductKeys.all, 'related'] as const,
  relatedList: (productId: string, categoryId: string) =>
    [...storefrontProductKeys.related(), productId, categoryId] as const,
}
