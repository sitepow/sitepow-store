export interface RestaurantTableFilterParams {
  storeId: string
  branchId?: string
}

export const restaurantTableKeys = {
  all: ['restaurant-tables'] as const,
  lists: () => [...restaurantTableKeys.all, 'list'] as const,
  list: (filters: RestaurantTableFilterParams) =>
    [...restaurantTableKeys.lists(), filters] as const,
  zones: (filters: RestaurantTableFilterParams) =>
    [...restaurantTableKeys.all, 'zones', filters] as const,
  details: () => [...restaurantTableKeys.all, 'detail'] as const,
  detail: (id: string) => [...restaurantTableKeys.details(), id] as const,
}
