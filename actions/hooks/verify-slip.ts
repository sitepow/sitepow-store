import { useMutation, useQueryClient } from '@tanstack/react-query'

import { storefrontOrderKeys } from '../query-keys/storefront/order'
import { verifySlip } from '../verify-slip'

export function useVerifySlip() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      orderId,
      slipImageUrl,
      storeId,
      customerId,
    }: {
      orderId: string
      slipImageUrl: string
      storeId: string
      customerId: string
    }) => await verifySlip(orderId, slipImageUrl, storeId, customerId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: storefrontOrderKeys.all,
      })
    },
  })
}
