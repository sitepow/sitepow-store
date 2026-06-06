import { ChangePasswordFormValues } from '@/zod/security-settings'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { securitySettingsKeys } from '../query-keys/security-settings'
import {
  getSecuritySettings,
  updateSecuritySettings,
  updateTwoFactor,
} from '../security-settings'

export function useSecuritySettings(userId: string) {
  return useQuery(
    queryOptions({
      queryKey: securitySettingsKeys.detail(userId),
      queryFn: async () => await getSecuritySettings(userId),
      enabled: !!userId,
    }),
  )
}

export function useUpdateSecuritySettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      input,
    }: {
      userId: string
      input: ChangePasswordFormValues
    }) => await updateSecuritySettings(userId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securitySettingsKeys.all })
    },
  })
}

export function useUpdateTwoFactor() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      userId,
      isTwoFactorEnabled,
    }: {
      userId: string
      isTwoFactorEnabled: boolean
    }) => await updateTwoFactor(userId, isTwoFactorEnabled),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: securitySettingsKeys.all })
    },
  })
}
