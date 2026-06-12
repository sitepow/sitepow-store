'use client'

import { transactionKeys } from '@/actions/query-keys/transaction'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { depositBalance, getStoreBalance } from '../deposit'

export function useDepositBalance() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: {
      storeId: string
      amount: number
      description?: string
    }) => depositBalance(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all })
    },
  })
}

export function useStoreBalance(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: transactionKeys.list({ storeId, page: 0 }),
      queryFn: () => getStoreBalance(storeId),
      enabled: !!storeId,
    }),
  )
}
