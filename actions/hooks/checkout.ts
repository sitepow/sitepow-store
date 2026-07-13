import { createCheckoutSession } from '@/actions/stripe/checkout'
import { CheckoutParams } from '@/types/checkout'
import { useMutation } from '@tanstack/react-query'

export function useCheckout() {
  return useMutation({
    mutationFn: (params: CheckoutParams) => {
      return createCheckoutSession(params)
    },
  })
}
