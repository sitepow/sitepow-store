import { Plan, StoreStatus } from '@/generated/prisma/enums'
import { queryOptions, useQuery } from '@tanstack/react-query'

import { storeKeys } from '../query-keys/store'
import { getStoreOptions, getStores } from '../store'

interface UseStoreOptionsParams {
  search?: string
  status?: StoreStatus
}

interface UseStoresParams {
  page?: number
  limit?: number
  search?: string
  status?: StoreStatus
  plan?: Plan
}

export function useStores({
  page = 1,
  limit = 10,
  search,
  status,
  plan,
}: UseStoresParams = {}) {
  const filters = { page, limit, search, status, plan }

  return useQuery(
    queryOptions({
      queryKey: storeKeys.list(filters),
      queryFn: async () => await getStores(filters),
      placeholderData: (previousData) => previousData,
    }),
  )
}

export function useStoreOptions(filters?: UseStoreOptionsParams) {
  return useQuery(
    queryOptions({
      queryKey: storeKeys.options(filters),
      queryFn: async () => await getStoreOptions(filters),
    }),
  )
}
