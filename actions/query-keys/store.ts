import { Plan, StoreStatus } from '@/generated/prisma/enums'

export const storeKeys = {
  all: ['stores'] as const,
  lists: () => [...storeKeys.all, 'list'] as const,
  list: (filters: {
    page?: number
    limit?: number
    search?: string
    status?: StoreStatus
    plan?: Plan
  }) => [...storeKeys.lists(), filters] as const,
  options: (filters?: { search?: string; status?: StoreStatus }) =>
    [...storeKeys.all, 'options', filters] as const,
  detail: (domain: string) => [...storeKeys.all, 'detail', domain] as const,
}
