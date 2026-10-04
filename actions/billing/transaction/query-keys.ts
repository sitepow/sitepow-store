import { TransactionType } from '@/generated/prisma/enums'

export const transactionKeys = {
  all: ['transactions'] as const,
  lists: () => [...transactionKeys.all, 'list'] as const,
  list: (filters: {
    storeId: string
    page?: number
    limit?: number
    type?: TransactionType
  }) => [...transactionKeys.lists(), filters] as const,
  balance: (storeId: string) =>
    [...transactionKeys.all, 'balance', storeId] as const,
}
