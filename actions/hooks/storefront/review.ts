import { storefrontReviewKeys } from '@/actions/query-keys/storefront/review'
import {
  CreateCustomerReviewParams,
  GetCustomerReviewsParams,
  UpdateCustomerReviewParams,
  createCustomerReview,
  getCustomerReviews,
  getPurchasableProductsForReview,
  updateCustomerReview,
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
    mutationFn: (params: CreateCustomerReviewParams) =>
      createCustomerReview(params),
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
    mutationFn: ({
      id,
      input,
    }: {
      id: string
      input: UpdateCustomerReviewParams
    }) => updateCustomerReview(id, input),
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

export function usePurchasableProducts() {
  return useQuery({
    queryKey: storefrontReviewKeys.purchasable(),
    queryFn: async () => (await getPurchasableProductsForReview()).data,
  })
}
