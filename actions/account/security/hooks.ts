import { ChangePasswordFormValues } from '@/zod/account/security'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { securitySettingsKeys } from '@/actions/account/security/query-keys'
import {
  getSecuritySettings,
  updateSecuritySettings,
  updateTwoFactor,
} from '@/actions/account/security/actions'

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
