export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: {
    storeId: string
    branchId?: string
    page?: number
    limit?: number
    search?: string
  }) => [...inventoryKeys.lists(), filters] as const,
  detail: (id: string) => [...inventoryKeys.all, 'detail', id] as const,
}
