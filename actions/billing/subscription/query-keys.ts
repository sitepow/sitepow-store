export const subscriptionKeys = {
  all: ['subscription'] as const,
  lists: (ownerId: string) =>
    [...subscriptionKeys.all, 'list', ownerId] as const,
  detail: (storeId: string) =>
    [...subscriptionKeys.all, 'detail', storeId] as const,
  invoices: (filters: object) =>
    [...subscriptionKeys.all, 'invoices', filters] as const,
  upgradeCost: (params: {
    storeId: string
    newPlan: string
    billingCycle: string
  }) => [...subscriptionKeys.all, 'upgrade-cost', params] as const,
}
