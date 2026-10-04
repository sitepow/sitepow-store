export const stockTransferKeys = {
  all: ['stock-transfers'] as const,
  lists: () => [...stockTransferKeys.all, 'list'] as const,
  list: (filters: {
    storeId: string
    branchId?: string
    variantId?: string
    page?: number
    limit?: number
    search?: string
  }) => [...stockTransferKeys.lists(), filters] as const,
}
