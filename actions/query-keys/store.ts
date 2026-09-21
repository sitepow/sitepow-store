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
  availability: (params: {
    name?: string
    slug?: string
    excludeId?: string
  }) => [...storeKeys.all, 'availability', params] as const,
  landing: (limit?: number) => [...storeKeys.all, 'landing', limit] as const,
  merchant: () => [...storeKeys.all, 'merchant'] as const,
  setupStatus: (storeId: string) =>
    [...storeKeys.merchant(), 'setup-status', storeId] as const,
}
