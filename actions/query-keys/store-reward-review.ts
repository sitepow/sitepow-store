export const StoreRewardReviewKeys = {
  all: ['store-reward-review'] as const,
  lists: () => [...StoreRewardReviewKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...StoreRewardReviewKeys.lists(), filters] as const,
  configs: () => [...StoreRewardReviewKeys.all, 'config'] as const,
  config: (storeId: string) =>
    [...StoreRewardReviewKeys.configs(), storeId] as const,
}
