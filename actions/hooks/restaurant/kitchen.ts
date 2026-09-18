import {
  type KitchenFilterParams,
  kitchenKeys,
} from '@/actions/query-keys/restaurant/kitchen'
import {
  getKitchenOrders,
  updateEntireTicketStatus,
  updateKitchenItemStatus,
} from '@/actions/restaurant/kitchen'
import type { KitchenItemStatus } from '@/generated/prisma/enums'
import type { KitchenTicketOrder } from '@/types/restaurant'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export function useKitchenOrders(
  filters: KitchenFilterParams,
  options?: { refetchInterval?: number },
) {
  return useQuery(
    queryOptions({
      queryKey: kitchenKeys.list(filters),
      queryFn: async () => {
        const res = await getKitchenOrders(filters)
        return (res.success && res.data ? res.data : []) as KitchenTicketOrder[]
      },
      enabled: Boolean(filters.storeId),
      refetchInterval: options?.refetchInterval ?? 5000,
    }),
  )
}

export function useUpdateKitchenItemStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { orderItemId: string; status: KitchenItemStatus }) =>
      updateKitchenItemStatus(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: kitchenKeys.all })
      }
    },
  })
}

export function useUpdateEntireTicketStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      orderId: string
      status: KitchenItemStatus
      branchId?: string
    }) => updateEntireTicketStatus(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: kitchenKeys.all })
      }
    },
  })
}
