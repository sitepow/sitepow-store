import { OrderStatus } from '@/generated/prisma/enums'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { storefrontOrderKeys } from '@/actions/storefront/order/query-keys'
import { createOrder, getStorefrontOrders } from '@/actions/storefront/order/actions'

export function useCreateOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storefrontOrderKeys.all })
    },
  })
}

export function useStorefrontOrders({
  page = 1,
  limit = 10,
  search,
  status,
  storeSlug,
}: {
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus
  storeSlug?: string
} = {}) {
  const filters = { page, limit, search, status, storeSlug }

  return useQuery(
    queryOptions({
      queryKey: storefrontOrderKeys.list(filters),
      queryFn: async () => await getStorefrontOrders(filters),
      placeholderData: (previousData) => previousData,
    }),
  )
}
