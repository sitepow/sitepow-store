export const couponKeys = {
  all: ['coupons'] as const,
  lists: () => [...couponKeys.all, 'list'] as const,
  list: (filters: {
    storeId: string
    page?: number
    limit?: number
    search?: string
  }) => [...couponKeys.lists(), filters] as const,
  detail: (id: string) => [...couponKeys.all, 'detail', id] as const,
}
