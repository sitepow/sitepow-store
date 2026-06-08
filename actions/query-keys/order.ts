import { OrderStatus } from '@/generated/prisma/enums'

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: {
    storeId: string
    page?: number
    limit?: number
    search?: string
    status?: OrderStatus
  }) => [...orderKeys.lists(), filters] as const,
}
