import { storefrontSecurityKeys } from '@/actions/query-keys/storefront/security'
import { updatePassword } from '@/actions/security'
import { ChangePasswordFormValues } from '@/zod/storefront/change-password'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdatePassword() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: ChangePasswordFormValues) => updatePassword(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storefrontSecurityKeys.all })
    },
  })
}
