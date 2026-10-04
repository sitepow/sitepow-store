import { SlipVerificationAction } from '@/types/slip'
import { useMutation, useQueryClient } from '@tanstack/react-query'

import { orderKeys } from '@/actions/sales/order/query-keys'
import { storefrontOrderKeys } from '@/actions/storefront/order/query-keys'
import { approveSlipManual, verifySlip } from '@/actions/sales/payment-verification/actions'

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

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: storefrontOrderKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: orderKeys.all,
        }),
      ])
    },
  })
}

export function useApproveSlipManual() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      orderId,
      action,
    }: {
      orderId: string
      action: SlipVerificationAction
    }) => approveSlipManual(orderId, action),

    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: storefrontOrderKeys.all,
        }),
        queryClient.invalidateQueries({
          queryKey: orderKeys.all,
        }),
      ])
    },
  })
}
