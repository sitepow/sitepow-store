import { restaurantOrderKeys } from '@/actions/query-keys/restaurant/order'
import {
  type SubmitTableOrderInput,
  getActiveTableOrders,
  getTableMenu,
  requestTableBill,
  submitTableOrder,
} from '@/actions/restaurant/order'
import type { ActiveTableOrder, TableMenuResponse } from '@/types/restaurant'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export function useTableMenu(tableToken: string) {
  return useQuery(
    queryOptions({
      queryKey: restaurantOrderKeys.menu(tableToken),
      queryFn: async () => {
        const res = await getTableMenu({ tableToken })
        if (!res.success || !res.data) {
          throw new Error(res.messageTH || 'Failed to fetch menu')
        }
        return res.data as TableMenuResponse
      },
      enabled: Boolean(tableToken),
    }),
  )
}

export function useActiveTableOrders(
  tableToken: string,
  options?: { refetchInterval?: number },
) {
  return useQuery(
    queryOptions({
      queryKey: restaurantOrderKeys.activeOrders(tableToken),
      queryFn: async () => {
        const res = await getActiveTableOrders({ tableToken })
        return (res.success && res.data ? res.data : []) as ActiveTableOrder[]
      },
      enabled: Boolean(tableToken),
      refetchInterval: options?.refetchInterval ?? 5000,
    }),
  )
}

export function useSubmitTableOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SubmitTableOrderInput) => submitTableOrder(input),
    onSuccess: (res, variables) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: restaurantOrderKeys.activeOrders(variables.tableToken),
        })
      }
    },
  })
}

export function useRequestTableBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ tableToken }: { tableToken: string }) =>
      requestTableBill({ tableToken }),
    onSuccess: (res, variables) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: restaurantOrderKeys.activeOrders(variables.tableToken),
        })
      }
    },
  })
}
