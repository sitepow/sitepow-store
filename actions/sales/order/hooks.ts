import { OrderStatus } from '@/generated/prisma/enums'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  cancelOrder,
  getOrders,
  updateOrderStatus,
  updateOrderTaxInfo,
  UpdateOrderTaxInfoInput,
} from '@/actions/sales/order/actions'
import { orderKeys } from '@/actions/sales/order/query-keys'
import { posProductKeys } from '@/actions/sales/pos-product/query-keys'
import { productKeys } from '@/actions/catalog/product/query-keys'
import { storefrontOrderKeys } from '@/actions/storefront/order/query-keys'

interface UseOrdersParams {
  storeId: string
  branchId?: string
  page?: number
  limit?: number
  search?: string
  status?: OrderStatus
}

export function useOrders({
  storeId,
  branchId,
  page = 1,
  limit = 10,
  search,
  status,
}: UseOrdersParams) {
  const filters = { storeId, branchId, page, limit, search, status }

  return useQuery(
    queryOptions({
      queryKey: orderKeys.list(filters),
      queryFn: async () => await getOrders(filters),
      enabled: !!storeId,
      placeholderData: (prev) => prev,
      refetchOnWindowFocus: true,
    }),
  )
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      status,
      trackingNumber,
    }: {
      id: string
      status: OrderStatus
      trackingNumber?: string
    }) => await updateOrderStatus(id, status, trackingNumber),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        queryClient.invalidateQueries({ queryKey: storefrontOrderKeys.all }),
        queryClient.invalidateQueries({ queryKey: posProductKeys.all }),
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
      ])
    },
  })
}

export function useCancelOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => await cancelOrder(id),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        queryClient.invalidateQueries({ queryKey: storefrontOrderKeys.all }),
        queryClient.invalidateQueries({ queryKey: posProductKeys.all }),
        queryClient.invalidateQueries({ queryKey: productKeys.all }),
      ])
    },
  })
}

export function useUpdateOrderTaxInfo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateOrderTaxInfoInput
    }) => await updateOrderTaxInfo(id, input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        queryClient.invalidateQueries({ queryKey: storefrontOrderKeys.all }),
      ])
    },
  })
}
