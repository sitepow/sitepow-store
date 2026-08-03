import { createPOSOrder } from '@/actions/pos/order'
import { posProductKeys } from '@/actions/query-keys/pos/product'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreatePOSOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createPOSOrder,
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: posProductKeys.all })
      }
    },
  })
}
