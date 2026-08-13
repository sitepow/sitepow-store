export const storefrontReviewKeys = {
  all: ['storefront', 'reviews'] as const,
  lists: () => [...storefrontReviewKeys.all, 'list'] as const,
  list: (filters: { page?: number; limit?: number; search?: string }) =>
    [...storefrontReviewKeys.lists(), filters] as const,
  detail: (id: string) => [...storefrontReviewKeys.all, 'detail', id] as const,
  purchasable: () => [...storefrontReviewKeys.all, 'purchasable'] as const,
}
