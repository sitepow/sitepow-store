import { storefrontNotificationKeys } from '@/actions/storefront/notification/query-keys'
import {
  getNotificationSettings,
  updateNotificationSettings,
} from '@/actions/storefront/notification/actions'
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
      queryKey: storefrontNotificationKeys.detail(),
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
      queryClient.invalidateQueries({
        queryKey: storefrontNotificationKeys.all,
      })
    },
  })
}
