import { OrderStatus } from '@/generated/prisma/enums'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { cancelOrder, getOrders, updateOrderStatus } from '../order'
import { orderKeys } from '../query-keys/order'

interface UseOrdersParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus
}

export function useOrders({
  storeId,
  page = 1,
  limit = 10,
  search,
  status,
}: UseOrdersParams) {
  const filters = { storeId, page, limit, search, status }

  return useQuery(
    queryOptions({
      queryKey: orderKeys.list(filters),
      queryFn: async () => await getOrders(filters),
      enabled: !!storeId,
      placeholderData: (prev) => prev,
    }),
  )
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: OrderStatus }) =>
      await updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => await cancelOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all })
    },
  })
}
