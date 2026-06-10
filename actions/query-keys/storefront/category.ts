export const storefrontCategoryKeys = {
  all: ['storefront', 'categories'] as const,
  lists: () => [...storefrontCategoryKeys.all, 'list'] as const,
  list: (filters: { storeSlug: string; search?: string }) =>
    [...storefrontCategoryKeys.lists(), filters] as const,
  options: (storeSlug: string) =>
    [...storefrontCategoryKeys.all, 'options', storeSlug] as const,
}
