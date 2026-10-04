import { storefrontSecurityKeys } from '@/actions/storefront/security/query-keys'
import { updatePassword } from '@/actions/storefront/security/actions'
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
