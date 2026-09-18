import {
  type RestaurantTableFilterParams,
  restaurantTableKeys,
} from '@/actions/query-keys/restaurant/table'
import { settleTableBill } from '@/actions/restaurant/order'
import {
  type CreateRestaurantTableInput,
  type CreateTableZoneInput,
  type UpdateRestaurantTableInput,
  type UpdateTableZoneInput,
  createRestaurantTable,
  createTableZone,
  deleteRestaurantTable,
  deleteTableZone,
  getRestaurantTables,
  getTableZones,
  openTableSession,
  regenerateTableQRToken,
  updateRestaurantTable,
  updateTableZone,
} from '@/actions/restaurant/table'
import { PaymentMethod } from '@/generated/prisma/enums'
import type {
  RestaurantTableItem,
  TableZoneWithCount,
} from '@/types/restaurant'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export function useTableZones(filters: RestaurantTableFilterParams) {
  return useQuery(
    queryOptions({
      queryKey: restaurantTableKeys.zones(filters),
      queryFn: async () => {
        const res = await getTableZones(filters)
        return (res.success && res.data ? res.data : []) as TableZoneWithCount[]
      },
      enabled: Boolean(filters.storeId),
    }),
  )
}

export function useRestaurantTables(
  filters: string | RestaurantTableFilterParams,
) {
  const normalizedFilters =
    typeof filters === 'string' ? { storeId: filters } : filters
  return useQuery(
    queryOptions({
      queryKey: restaurantTableKeys.list(normalizedFilters),
      queryFn: async () => {
        const res = await getRestaurantTables(normalizedFilters)
        return (
          res.success && res.data ? res.data : []
        ) as RestaurantTableItem[]
      },
      enabled: Boolean(normalizedFilters.storeId),
    }),
  )
}

export function useCreateTableZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateTableZoneInput) => createTableZone(input),
    onSuccess: (res, variables) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: restaurantTableKeys.zones({ storeId: variables.storeId }),
        })
      }
    },
  })
}

export function useUpdateTableZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateTableZoneInput) => updateTableZone(input),
    onSuccess: (res, variables) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: restaurantTableKeys.all,
        })
      }
    },
  })
}

export function useDeleteTableZone() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteTableZone({ id }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: restaurantTableKeys.all })
      }
    },
  })
}

export function useCreateRestaurantTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateRestaurantTableInput) =>
      createRestaurantTable(input),
    onSuccess: (res, variables) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: restaurantTableKeys.list({ storeId: variables.storeId }),
        })
      }
    },
  })
}

export function useUpdateRestaurantTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdateRestaurantTableInput) =>
      updateRestaurantTable(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: restaurantTableKeys.all })
      }
    },
  })
}

export function useDeleteRestaurantTable() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string }) => deleteRestaurantTable({ id }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: restaurantTableKeys.all })
      }
    },
  })
}

export function useRegenerateTableQRToken() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id }: { id: string }) => regenerateTableQRToken({ id }),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: restaurantTableKeys.all })
      }
    },
  })
}

export function useOpenTableSession() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      tableId: string
      storeId?: string
      guestCount?: number
    }) => openTableSession(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: restaurantTableKeys.all })
      }
    },
  })
}

export function useSettleTableBill() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: {
      tableId: string
      storeId?: string
      paymentMethod?: PaymentMethod
      receivedAmount?: number
      changeAmount?: number
    }) => settleTableBill(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: restaurantTableKeys.all })
      }
    },
  })
}
