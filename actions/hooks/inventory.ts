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
import { invalidateClientInventoryQueries } from '../query-keys/invalidation/inventory'
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
    onSuccess: (result) => {
      if (result && 'data' in result && result.data?.branch?.storeId) {
        invalidateClientInventoryQueries(
          queryClient,
          result.data.branch.storeId,
          result.data.branch.id,
        )
      } else {
        queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() })
      }
    },
  })
}

export function useUpsertStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpsertStockInput) => await upsertStock(input),
    onSuccess: (result, variables) => {
      invalidateClientInventoryQueries(
        queryClient,
        result && 'data' in result ? result.data?.branch?.storeId : undefined,
        variables.branchId,
      )
    },
  })
}
