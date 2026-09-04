'use client'

import toast from 'react-hot-toast'

import {
  autoMapProductsBySku,
  deleteProductMapping,
  disconnectMarketplace,
  getMarketplaceConnections,
  getMarketplaceMappings,
  getMarketplaceSyncLogs,
  saveMarketplaceConnection,
  saveProductMapping,
  simulateInboundOrder,
  toggleMarketplaceAutoSync,
  triggerManualSync,
} from '@/actions/marketplace'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  connections: (storeId: string) =>
    [...marketplaceKeys.all, 'connections', storeId] as const,
  mappings: (storeId: string, connectionId?: string) =>
    [...marketplaceKeys.all, 'mappings', storeId, connectionId] as const,
  logs: (storeId: string, page: number) =>
    [...marketplaceKeys.all, 'logs', storeId, page] as const,
}

export function useMarketplaceConnections(storeId?: string) {
  return useQuery({
    queryKey: marketplaceKeys.connections(storeId || ''),
    queryFn: async () => {
      if (!storeId) return []
      return await getMarketplaceConnections(storeId)
    },
    enabled: Boolean(storeId),
  })
}

export function useSaveMarketplaceConnection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ storeId, data }: { storeId: string; data: any }) =>
      await saveMarketplaceConnection(storeId, data),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success(res.message)
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.connections(variables.storeId),
        })
      } else {
        toast.error(res.message)
      }
    },
    onError: () => toast.error('บันทึกการเชื่อมต่อล้มเหลว'),
  })
}

export function useToggleMarketplaceAutoSync() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      connectionId,
      isAutoSync,
      storeId,
    }: {
      connectionId: string
      isAutoSync: boolean
      storeId: string
    }) => {
      const res = await toggleMarketplaceAutoSync(connectionId, isAutoSync)
      return { ...res, storeId }
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.connections(res.storeId),
        })
      } else {
        toast.error(res.message)
      }
    },
  })
}

export function useDisconnectMarketplace() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      connectionId,
      storeId,
    }: {
      connectionId: string
      storeId: string
    }) => {
      const res = await disconnectMarketplace(connectionId)
      return { ...res, storeId }
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.connections(res.storeId),
        })
      } else {
        toast.error(res.message)
      }
    },
  })
}

export function useMarketplaceMappings(
  storeId?: string,
  connectionId?: string,
) {
  return useQuery({
    queryKey: marketplaceKeys.mappings(storeId || '', connectionId),
    queryFn: async () => {
      if (!storeId) return []
      return await getMarketplaceMappings(storeId, connectionId)
    },
    enabled: Boolean(storeId),
  })
}

export function useAutoMapProductsBySku() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      storeId,
      connectionId,
    }: {
      storeId: string
      connectionId: string
    }) => await autoMapProductsBySku(storeId, connectionId),
    onSuccess: (res, variables) => {
      if (res.success) {
        toast.success(res.message)
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.mappings(variables.storeId),
        })
      } else {
        toast.error(res.message)
      }
    },
  })
}

export function useSaveProductMapping() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({ storeId, data }: { storeId: string; data: any }) => {
      const res = await saveProductMapping(data)
      return { ...res, storeId }
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.mappings(res.storeId),
        })
      } else {
        toast.error(res.message)
      }
    },
  })
}

export function useDeleteProductMapping() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      mappingId,
      storeId,
    }: {
      mappingId: string
      storeId: string
    }) => {
      const res = await deleteProductMapping(mappingId)
      return { ...res, storeId }
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.mappings(res.storeId),
        })
      } else {
        toast.error(res.message)
      }
    },
  })
}

export function useTriggerManualSync() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      connectionId,
      variantId,
      storeId,
    }: {
      connectionId: string
      variantId?: string
      storeId: string
    }) => {
      const res = await triggerManualSync(connectionId, variantId)
      return { ...res, storeId }
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.mappings(res.storeId),
        })
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.logs(res.storeId, 1),
        })
      } else {
        toast.error(res.message)
      }
    },
  })
}

export function useMarketplaceSyncLogs(
  storeId?: string,
  page: number = 1,
  limit: number = 20,
) {
  return useQuery({
    queryKey: marketplaceKeys.logs(storeId || '', page),
    queryFn: async () => {
      if (!storeId) return { data: [], total: 0, page: 1, limit }
      return await getMarketplaceSyncLogs(storeId, page, limit)
    },
    enabled: Boolean(storeId),
  })
}

export function useSimulateInboundOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async ({
      storeId,
      connectionId,
      sku,
      quantity,
    }: {
      storeId: string
      connectionId: string
      sku: string
      quantity: number
    }) => {
      const res = await simulateInboundOrder(
        storeId,
        connectionId,
        sku,
        quantity,
      )
      return { ...res, storeId }
    },
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message)
        queryClient.invalidateQueries({
          queryKey: ['inventory'],
        })
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.mappings(res.storeId),
        })
        queryClient.invalidateQueries({
          queryKey: marketplaceKeys.logs(res.storeId, 1),
        })
      } else {
        toast.error(res.message)
      }
    },
  })
}
