import {
  createCheckoutSession,
  createStoreCheckoutSession,
} from '@/actions/stripe/checkout'
import { useMutation } from '@tanstack/react-query'

export function useCheckout() {
  return useMutation({
    mutationFn: createCheckoutSession,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
  })
}

export function useStoreCheckout() {
  return useMutation({
    mutationFn: createStoreCheckoutSession,
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url
      }
    },
  })
}
