import { storefrontReviewKeys } from '@/actions/query-keys/storefront/review'
import {
  CreateReviewInput,
  UpdateReviewInput,
  createReview,
  updateReview,
} from '@/actions/review'
import {
  GetCustomerReviewsParams,
  getCustomerReviews,
} from '@/actions/storefront/review'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useStorefrontReviews(params: GetCustomerReviewsParams = {}) {
  return useQuery({
    queryKey: storefrontReviewKeys.list(params),
    queryFn: () => getCustomerReviews(params),
  })
}

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateReviewInput) => createReview(input),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: storefrontReviewKeys.all,
        })
      }
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateReviewInput }) =>
      updateReview(id, input),
    onSuccess: (res, variables) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: storefrontReviewKeys.all,
        })
        queryClient.invalidateQueries({
          queryKey: storefrontReviewKeys.detail(variables.id),
        })
      }
    },
  })
}
