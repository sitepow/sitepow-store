import { queryOptions, useQuery } from '@tanstack/react-query'

import { reviewKeys } from '../query-keys/review'
import { getReviews } from '../review'

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
