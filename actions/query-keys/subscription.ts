export const subscriptionKeys = {
  all: ['subscriptions'] as const,
  lists: (ownerId: string) =>
    [...subscriptionKeys.all, 'list', ownerId] as const,
  detail: (storeId: string) =>
    [...subscriptionKeys.all, 'detail', storeId] as const,
  transactions: (filters: {
    ownerId: string
    storeId?: string
    page?: number
    limit?: number
  }) => [...subscriptionKeys.all, 'transactions', filters] as const,
}
