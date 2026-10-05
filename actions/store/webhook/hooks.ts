import toast from 'react-hot-toast'

import { WebhookEndpointFormValues } from '@/zod/store/webhook-settings'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  createWebhookEndpoint,
  deleteWebhookEndpoint,
  getWebhookDeliveries,
  getWebhookEndpoints,
  regenerateWebhookSecretAction,
  retryWebhookDeliveryAction,
  testWebhookEndpointAction,
  updateWebhookEndpoint,
} from './actions'
import { webhookKeys } from './query-keys'

export function useWebhookEndpoints(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: webhookKeys.endpoints(storeId),
      queryFn: async () => await getWebhookEndpoints(storeId),
      enabled: Boolean(storeId),
    }),
  )
}

export function useWebhookDeliveries(storeId: string, endpointId?: string) {
  return useQuery(
    queryOptions({
      queryKey: webhookKeys.deliveries(storeId, endpointId),
      queryFn: async () => await getWebhookDeliveries(storeId, endpointId),
      enabled: Boolean(storeId),
      refetchInterval: 10000, // Poll every 10s if active
    }),
  )
}

export function useCreateWebhookEndpoint(storeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: WebhookEndpointFormValues) =>
      await createWebhookEndpoint(storeId, input),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || 'สร้าง Webhook สำเร็จ')
        queryClient.invalidateQueries({
          queryKey: webhookKeys.endpoints(storeId),
        })
      } else {
        toast.error(res.message || 'เกิดข้อผิดพลาดในการสร้าง Webhook')
      }
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการสร้าง Webhook',
      )
    },
  })
}

export function useUpdateWebhookEndpoint(storeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: Partial<WebhookEndpointFormValues>
    }) => await updateWebhookEndpoint(id, storeId, input),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || 'อัปเดต Webhook สำเร็จ')
        queryClient.invalidateQueries({
          queryKey: webhookKeys.endpoints(storeId),
        })
      } else {
        toast.error(res.message || 'เกิดข้อผิดพลาดในการอัปเดต Webhook')
      }
    },
    onError: (err) => {
      toast.error(
        err instanceof Error
          ? err.message
          : 'เกิดข้อผิดพลาดในการอัปเดต Webhook',
      )
    },
  })
}

export function useDeleteWebhookEndpoint(storeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => await deleteWebhookEndpoint(id, storeId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || 'ลบ Webhook สำเร็จ')
        queryClient.invalidateQueries({
          queryKey: webhookKeys.endpoints(storeId),
        })
      } else {
        toast.error(res.message || 'เกิดข้อผิดพลาดในการลบ Webhook')
      }
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการลบ Webhook',
      )
    },
  })
}

export function useRegenerateWebhookSecret(storeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) =>
      await regenerateWebhookSecretAction(id, storeId),
    onSuccess: (res) => {
      if (res.success) {
        toast.success(res.message || 'สร้าง Secret ใหม่สำเร็จ')
        queryClient.invalidateQueries({
          queryKey: webhookKeys.endpoints(storeId),
        })
      } else {
        toast.error(res.message || 'เกิดข้อผิดพลาด')
      }
    },
    onError: (err) => {
      toast.error(err instanceof Error ? err.message : 'เกิดข้อผิดพลาด')
    },
  })
}

export function useTestWebhookEndpoint(storeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (endpointId: string) =>
      await testWebhookEndpointAction(endpointId, storeId),
    onSuccess: (res) => {
      if (res.success && res.data?.success) {
        toast.success(res.message || 'ส่งทดสอบสำเร็จ')
      } else {
        toast.error(res.message || 'ส่งทดสอบไม่สำเร็จ')
      }
      queryClient.invalidateQueries({
        queryKey: webhookKeys.deliveries(storeId),
      })
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งทดสอบ',
      )
    },
  })
}

export function useRetryWebhookDelivery(storeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (deliveryId: string) =>
      await retryWebhookDeliveryAction(deliveryId, storeId),
    onSuccess: (res) => {
      if (res.success && res.data?.success) {
        toast.success(res.message || 'ส่งซ้ำสำเร็จ')
      } else {
        toast.error(res.message || 'ส่งซ้ำไม่สำเร็จ')
      }
      queryClient.invalidateQueries({
        queryKey: webhookKeys.deliveries(storeId),
      })
    },
    onError: (err) => {
      toast.error(
        err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการส่งซ้ำ',
      )
    },
  })
}
