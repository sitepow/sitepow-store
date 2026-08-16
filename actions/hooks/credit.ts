import { transactionKeys } from '@/actions/query-keys/transaction'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { getStoreCredit, purchaseCredit } from '../credit'

export function usePurchaseCredit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      storeId: string
      amount: number
      description?: string
    }) => purchaseCredit(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}

export function useStoreCredit(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: transactionKeys.list({ storeId, page: 0 }),
      queryFn: () => getStoreCredit(storeId),
      enabled: !!storeId,
    }),
  )
}
