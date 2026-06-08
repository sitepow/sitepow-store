import { TransactionType } from '@/generated/prisma/enums'
import { queryOptions, useQuery } from '@tanstack/react-query'

import { transactionKeys } from '../query-keys/transaction'
import { getTransactions } from '../transaction'

interface UseTransactionsParams {
  storeId: string
  page?: number
  limit?: number
  type?: TransactionType
}

export function useTransactions({
  storeId,
  page = 1,
  limit = 10,
  type,
}: UseTransactionsParams) {
  const filters = { storeId, page, limit, type }

  return useQuery(
    queryOptions({
      queryKey: transactionKeys.list(filters),
      queryFn: async () => await getTransactions(filters),
      enabled: !!storeId,
      placeholderData: (prev) => prev,
    }),
  )
}
