export interface KitchenFilterParams {
  storeId: string
  branchId?: string
}

export const kitchenKeys = {
  all: ['kitchen-orders'] as const,
  lists: () => [...kitchenKeys.all, 'list'] as const,
  list: (filters: KitchenFilterParams) =>
    [...kitchenKeys.lists(), filters] as const,
}
