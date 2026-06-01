import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  UpdateStockInput,
  UpsertStockInput,
  getInventory,
  updateStock,
  upsertStock,
} from '../inventory'
import { inventoryKeys } from '../query-keys/inventory'

interface UseInventoryParams {
  storeId: string
  branchId?: string
  page?: number
  limit?: number
  search?: string
}

export function useInventory({
  storeId,
  branchId,
  page = 1,
  limit = 10,
  search,
}: UseInventoryParams) {
  const filters = { storeId, branchId, page, limit, search }

  return useQuery(
    queryOptions({
      queryKey: inventoryKeys.list(filters),
      queryFn: async () => await getInventory(filters),
      enabled: !!storeId,
      placeholderData: (previousData) => previousData,
    }),
  )
}

export function useUpdateStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateStockInput
    }) => await updateStock(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
    },
  })
}

export function useUpsertStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpsertStockInput) => await upsertStock(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
    },
  })
}
