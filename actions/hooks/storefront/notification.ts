'use client'

import { notificationKeys } from '@/actions/query-keys/storefront/notification'
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/actions/storefront/notification'
import { NotificationSettingsFormValues } from '@/zod/storefront/notification-settings'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export function useNotificationSettings() {
  return useQuery(
    queryOptions({
      queryKey: notificationKeys.detail(),
      queryFn: getNotificationSettings,
    }),
  )
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: NotificationSettingsFormValues) =>
      updateNotificationSettings(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
