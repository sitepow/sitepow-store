import { createPOSOrder } from '@/actions/pos/order'
import { orderKeys } from '@/actions/query-keys/order'
import { posProductKeys } from '@/actions/query-keys/pos/product'
import { productKeys } from '@/actions/query-keys/product'
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
