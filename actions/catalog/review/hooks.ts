import { queryOptions, useQuery } from '@tanstack/react-query'

import { reviewKeys } from '@/actions/catalog/review/query-keys'
import { getReviews } from '@/actions/catalog/review/actions'

interface UseReviewsParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

export function useReviews({
  storeId,
  page = 1,
  limit = 10,
  search,
}: UseReviewsParams) {
  const filters = { storeId, page, limit, search }

  return useQuery(
    queryOptions({
      queryKey: reviewKeys.list(filters),
      queryFn: async () => await getReviews(filters),
      enabled: !!storeId,
      placeholderData: (previousData) => previousData,
    }),
  )
}
