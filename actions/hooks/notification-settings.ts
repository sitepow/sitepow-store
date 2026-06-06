import { NotificationSettingsFormValues } from '@/zod/notification-settings'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  getNotificationSettings,
  updateNotificationSettings,
} from '../notification-settings'
import { notificationSettingsKeys } from '../query-keys/notification-settings'

export function useNotificationSettings(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: notificationSettingsKeys.detail(storeId),
      queryFn: async () => await getNotificationSettings(storeId),
      enabled: !!storeId,
    }),
  )
}

export function useUpdateNotificationSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      input,
    }: {
      storeId: string
      input: NotificationSettingsFormValues
    }) => await updateNotificationSettings(storeId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationSettingsKeys.all })
    },
  })
}
