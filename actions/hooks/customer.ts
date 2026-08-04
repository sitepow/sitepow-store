import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  CreateCustomer,
  POSCustomerSearch,
  blockCustomer,
  createCustomer,
  getCustomers,
  searchCustomer,
  unblockCustomer,
} from '../customer'
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

export function useSearchCustomer() {
  return useMutation({
    mutationFn: async ({
      storeId,
      query,
    }: {
      storeId: string
      query: string
    }) => {
      const res = await searchCustomer({ storeId, query })

      if (!res.success || !res.data) {
        throw new Error(res.message)
      }

      return res.data
    },
  })
}

export function useCreateCustomer() {
  return useMutation<POSCustomerSearch, Error, CreateCustomer>({
    mutationFn: async (payload) => {
      const res = await createCustomer(payload)

      if (!res.success || !res.data) {
        throw new Error(res.message)
      }

      return res.data
    },
  })
}
