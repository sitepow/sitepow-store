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
  detail: (storeSlug: string, productSlug: string) =>
    [...storefrontProductKeys.all, 'detail', storeSlug, productSlug] as const,
}
