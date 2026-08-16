import { queryOptions, useQuery } from '@tanstack/react-query'

import { StoreRewardReviewKeys } from '../query-keys/store-reward-review'
import { getReviewRewardConfig } from '../store-reward-review'

export function useReviewRewardConfig(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: StoreRewardReviewKeys.config(storeId),
      queryFn: () => getReviewRewardConfig(storeId),
      enabled: !!storeId,
    }),
  )
}
