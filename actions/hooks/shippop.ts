import { useMutation } from '@tanstack/react-query'

import { GetPriceInput, getShippingPrice } from '../shippop'

export function useGetShippingPrice() {
  return useMutation({
    mutationFn: async (input: GetPriceInput) => await getShippingPrice(input),
  })
}
