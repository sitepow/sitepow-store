import { createCheckoutSession } from '@/actions/stripe/checkout'
import { useMutation } from '@tanstack/react-query'

export function useCheckout() {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      window.location.href = data.url!
    },
  })
}
