import { ALL_STORES } from '@/stores/use-store-filter'
import { WebhookEndpointFormValues } from '@/zod/webhook'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { webhookKeys } from '../query-keys/webhook'
import {
  createStoreWebhookEndpoint,
  deleteStoreWebhookEndpoint,
  getStoreWebhookEndpoints,
  getStoreWebhookLogs,
  regenerateWebhookSecret,
  resendWebhookLog,
  testWebhookEndpoint,
  updateStoreWebhookEndpoint,
} from '../webhook'

export function useStoreWebhookEndpoints(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: webhookKeys.list(storeId),
      queryFn: async () => await getStoreWebhookEndpoints(storeId),
      enabled: !!storeId && storeId !== ALL_STORES,
    }),
  )
}

export function useWebhookLogs(endpointId?: string) {
  return useQuery(
    queryOptions({
      queryKey: webhookKeys.logs(endpointId || ''),
      queryFn: async () => {
        if (!endpointId) return []
        return await getStoreWebhookLogs(endpointId)
      },
      enabled: !!endpointId,
    }),
  )
}

export function useCreateWebhookEndpoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      data,
    }: {
      storeId: string
      data: WebhookEndpointFormValues
    }) => await createStoreWebhookEndpoint(storeId, data),
    onSuccess: (res, variables) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: webhookKeys.list(variables.storeId),
        })
      }
    },
  })
}

export function useUpdateWebhookEndpoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      endpointId,
      storeId: _storeId,
      data,
    }: {
      endpointId: string
      storeId: string
      data: WebhookEndpointFormValues
    }) => await updateStoreWebhookEndpoint(endpointId, data),
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.invalidateQueries({
          queryKey: webhookKeys.list(res.data.storeId),
        })
      }
    },
  })
}

export function useDeleteWebhookEndpoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (endpointId: string) =>
      await deleteStoreWebhookEndpoint(endpointId),
    onSuccess: (res) => {
      if (res.success && res.storeId) {
        queryClient.invalidateQueries({
          queryKey: webhookKeys.list(res.storeId),
        })
      }
    },
  })
}

export function useRegenerateWebhookSecret() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (endpointId: string) =>
      await regenerateWebhookSecret(endpointId),
    onSuccess: (res) => {
      if (res.success && res.data) {
        queryClient.invalidateQueries({
          queryKey: webhookKeys.list(res.data.storeId),
        })
      }
    },
  })
}

export function useTestWebhookEndpoint() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (endpointId: string) =>
      await testWebhookEndpoint(endpointId),
    onSuccess: (res, endpointId) => {
      if (res.storeId) {
        queryClient.invalidateQueries({
          queryKey: webhookKeys.list(res.storeId),
        })
      }
      queryClient.invalidateQueries({
        queryKey: webhookKeys.logs(endpointId),
      })
    },
  })
}

export function useResendWebhookLog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (logId: string) => await resendWebhookLog(logId),
    onSuccess: (res) => {
      if (res.endpointId) {
        queryClient.invalidateQueries({
          queryKey: webhookKeys.logs(res.endpointId),
        })
      }
      if (res.storeId) {
        queryClient.invalidateQueries({
          queryKey: webhookKeys.list(res.storeId),
        })
      }
    },
  })
}
