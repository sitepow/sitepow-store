import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { blockCustomer, getCustomers, unblockCustomer } from '../customer'
import { customerKeys } from '../query-keys/customer'

interface UseCustomersParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

export function useCustomers({
  storeId,
  page = 1,
  limit = 10,
  search,
}: UseCustomersParams) {
  const filters = { storeId, page, limit, search }

  return useQuery(
    queryOptions({
      queryKey: customerKeys.list(filters),
      queryFn: async () => await getCustomers(filters),
      enabled: !!storeId,
      placeholderData: (prev) => prev,
    }),
  )
}

export function useUnblockCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      customerId,
      storeId,
    }: {
      customerId: string
      storeId: string
    }) => unblockCustomer(customerId, storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
    },
  })
}

export function useBlockCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      customerId,
      storeId,
    }: {
      customerId: string
      storeId: string
    }) => blockCustomer(customerId, storeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all })
    },
  })
}
