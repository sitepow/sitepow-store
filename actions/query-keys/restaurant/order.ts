export const restaurantOrderKeys = {
  all: ['restaurant-orders'] as const,
  menu: (token: string) => [...restaurantOrderKeys.all, 'menu', token] as const,
  activeOrders: (token: string) =>
    [...restaurantOrderKeys.all, 'active', token] as const,
}
