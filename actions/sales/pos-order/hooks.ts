import { createPOSOrder } from '@/actions/sales/pos-order/actions'
import { orderKeys } from '@/actions/sales/order/query-keys'
import { posProductKeys } from '@/actions/sales/pos-product/query-keys'
import { productKeys } from '@/actions/catalog/product/query-keys'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreatePOSOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPOSOrder,
    onSuccess: async (res) => {
      if (res.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: posProductKeys.all }),
          queryClient.invalidateQueries({ queryKey: productKeys.all }),
          queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        ])
      }
    },
  })
}
