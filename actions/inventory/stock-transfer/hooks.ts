import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { inventoryKeys } from '@/actions/inventory/stock/query-keys'
import { stockTransferKeys } from '@/actions/inventory/stock-transfer/query-keys'
import {
  CreateStockTransferInput,
  createStockTransfer,
  getStockTransfers,
} from '@/actions/inventory/stock-transfer/actions'

interface UseStockTransfersParams {
  storeId: string
  branchId?: string
  variantId?: string
  page?: number
  limit?: number
  search?: string
}

export function useStockTransfers({
  storeId,
  branchId,
  variantId,
  page = 1,
  limit = 10,
  search,
}: UseStockTransfersParams) {
  const filters = { storeId, branchId, variantId, page, limit, search }

  return useQuery(
    queryOptions({
      queryKey: stockTransferKeys.list(filters),
      queryFn: async () => await getStockTransfers(filters),
      enabled: !!storeId,
      placeholderData: (previousData) => previousData,
    }),
  )
}

export function useCreateStockTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateStockTransferInput) =>
      await createStockTransfer(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: stockTransferKeys.lists() })
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
    },
  })
}
