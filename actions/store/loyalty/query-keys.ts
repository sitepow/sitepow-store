export const loyaltyKeys = {
  all: ['loyalty'] as const,
  settings: (storeId: string) =>
    [...loyaltyKeys.all, 'settings', storeId] as const,
  customers: (filters: {
    storeId: string
    page?: number
    limit?: number
    search?: string
  }) => [...loyaltyKeys.all, 'customers', filters] as const,
}
