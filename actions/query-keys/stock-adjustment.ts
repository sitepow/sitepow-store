export const stockAdjustmentKeys = {
  all: ['stock-adjustments'] as const,
  lists: () => [...stockAdjustmentKeys.all, 'list'] as const,
  list: (filters: {
    storeId: string
    branchId?: string
    variantId?: string
    page?: number
    limit?: number
    search?: string
  }) => [...stockAdjustmentKeys.lists(), filters] as const,
}
