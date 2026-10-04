import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { inventoryKeys } from '@/actions/inventory/stock/query-keys'
import { stockAdjustmentKeys } from '@/actions/inventory/stock-adjustment/query-keys'
import {
  CreateStockAdjustmentInput,
  createStockAdjustment,
  getStockAdjustments,
} from '@/actions/inventory/stock-adjustment/actions'

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
