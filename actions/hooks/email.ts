import { resendOtp, verifyOtp } from '@/actions/email'
import { useSession } from '@/hooks/use-session'
import { useMutation } from '@tanstack/react-query'

export function useVerifyOtp() {
  const { update } = useSession()

  return useMutation({
    mutationFn: async ({ otp }: { otp: string }) => await verifyOtp({ otp }),
    onSuccess: async (result) => {
      if (result.success) {
        await update({
          user: {
            isEmailVerified: true,
          },
        })
      }
    },
  })
}

export function useResendOtp() {
  return useMutation({
    mutationFn: async () => await resendOtp(),
  })
}
