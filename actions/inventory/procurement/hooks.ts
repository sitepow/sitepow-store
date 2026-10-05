import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPurchaseOrder,
  CreatePurchaseOrderInput,
  deletePurchaseOrder,
  getPurchaseOrder,
  getPurchaseOrders,
  updatePurchaseOrderItem,
  UpdatePurchaseItemInput,
} from './actions'
import { procurementKeys } from './query-keys'

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: procurementKeys.detail(id),
    queryFn: async () => await getPurchaseOrder(id),
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5s while on checklist page for real-time sync
  })
}

export function usePurchaseOrders(storeId: string) {
  return useQuery({
    queryKey: procurementKeys.list(storeId),
    queryFn: async () => await getPurchaseOrders(storeId),
    enabled: !!storeId,
  })
}

export function useCreatePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePurchaseOrderInput) =>
      await createPurchaseOrder(input),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({
        queryKey: procurementKeys.list(vars.storeId),
      })
    },
  })
}

export function useUpdatePurchaseOrderItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdatePurchaseItemInput) =>
      await updatePurchaseOrderItem(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: procurementKeys.all,
      })
    },
  })
}

export function useDeletePurchaseOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => await deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: procurementKeys.all,
      })
    },
  })
}

