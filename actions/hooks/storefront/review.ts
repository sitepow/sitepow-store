import { reviewKeys } from '@/actions/query-keys/review'
import { storefrontProductKeys } from '@/actions/query-keys/storefront/product'
import { storefrontReviewKeys } from '@/actions/query-keys/storefront/review'
import {
  CreateCustomerReviewParams,
  GetCustomerReviewsParams,
  UpdateCustomerReviewParams,
  createCustomerReview,
  deleteCustomerReview,
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
        queryClient.invalidateQueries({
          queryKey: storefrontProductKeys.all,
        })
        queryClient.invalidateQueries({
          queryKey: reviewKeys.all,
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
        queryClient.invalidateQueries({
          queryKey: storefrontProductKeys.all,
        })
        queryClient.invalidateQueries({
          queryKey: reviewKeys.all,
        })
        queryClient.invalidateQueries({
          queryKey: reviewKeys.detail(variables.id),
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

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteCustomerReview(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: storefrontReviewKeys.all,
        })
        queryClient.invalidateQueries({
          queryKey: storefrontProductKeys.all,
        })
        queryClient.invalidateQueries({
          queryKey: reviewKeys.all,
        })
      }
    },
  })
}
