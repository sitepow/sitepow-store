export const storefrontReviewKeys = {
  all: ['storefront', 'reviews'] as const,
  lists: () => [...storefrontReviewKeys.all, 'list'] as const,
  list: (filters: { page?: number; limit?: number; search?: string }) =>
    [...storefrontReviewKeys.lists(), filters] as const,
  detail: (id: string) => [...storefrontReviewKeys.all, 'detail', id] as const,
  purchasable: (storeSlug?: string) =>
    [...storefrontReviewKeys.all, 'purchasable', storeSlug] as const,
  storeSummary: (storeId: string) =>
    [...storefrontReviewKeys.all, 'storeSummary', storeId] as const,
  storeList: (
    storeId: string,
    filters: {
      page?: number
      limit?: number
      rating?: number
      hasMedia?: boolean
    },
  ) => [...storefrontReviewKeys.all, 'storeList', storeId, filters] as const,
}
