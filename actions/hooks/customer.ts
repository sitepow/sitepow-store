import { queryOptions, useQuery } from '@tanstack/react-query'

import { getCustomers } from '../customer'
import { customerKeys } from '../query-keys/customer'

interface UseCustomersParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

export function useCustomers({
  storeId,
  page = 1,
  limit = 10,
  search,
}: UseCustomersParams) {
  const filters = { storeId, page, limit, search }

  return useQuery(
    queryOptions({
      queryKey: customerKeys.list(filters),
      queryFn: async () => await getCustomers(filters),
      enabled: !!storeId,
      placeholderData: (prev) => prev,
    }),
  )
}
