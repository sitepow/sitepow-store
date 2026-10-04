import {
  getReviewRewardConfig,
  updateReviewRewardConfig,
} from '@/actions/store/review-reward/actions'
import { ReviewRewardConfigFormValues } from '@/zod/store/review-reward-settings'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { queryOptions } from '@tanstack/react-query'

import { StoreRewardReviewKeys } from '@/actions/store/review-reward/query-keys'

export function useReviewRewardConfig(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: StoreRewardReviewKeys.config(storeId),
      queryFn: () => getReviewRewardConfig(storeId),
      enabled: !!storeId,
    }),
  )
}

export function useUpdateReviewRewardConfig(storeId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values: ReviewRewardConfigFormValues) =>
      updateReviewRewardConfig(storeId, values),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: StoreRewardReviewKeys.config(storeId),
        })
      }
    },
  })
}
