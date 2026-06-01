import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { inventoryKeys } from '../query-keys/inventory'
import { stockAdjustmentKeys } from '../query-keys/stock-adjustment'
import {
  CreateStockAdjustmentInput,
  createStockAdjustment,
  getStockAdjustments,
} from '../stock-adjustment'

interface UseStockAdjustmentsParams {
  storeId: string
  branchId?: string
  variantId?: string
  page?: number
  limit?: number
  search?: string
}

export function useStockAdjustments({
  storeId,
  branchId,
  variantId,
  page = 1,
  limit = 10,
  search,
}: UseStockAdjustmentsParams) {
  const filters = { storeId, branchId, variantId, page, limit, search }

  return useQuery(
    queryOptions({
      queryKey: stockAdjustmentKeys.list(filters),
      queryFn: async () => await getStockAdjustments(filters),
      enabled: !!storeId,
      placeholderData: (previousData) => previousData,
    }),
  )
}

export function useCreateStockAdjustment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateStockAdjustmentInput) =>
      await createStockAdjustment(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockAdjustmentKeys.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
    },
  })
}
