import { reviewKeys } from '@/actions/catalog/review/query-keys'
import { storefrontProductKeys } from '@/actions/storefront/product/query-keys'
import { storefrontReviewKeys } from '@/actions/storefront/review/query-keys'
import {
  CreateCustomerReviewParams,
  GetCustomerReviewsParams,
  UpdateCustomerReviewParams,
  createCustomerReview,
  deleteCustomerReview,
  getCustomerReviews,
  getPurchasableProductsForReview,
  updateCustomerReview,
} from '@/actions/storefront/review/actions'
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

export function usePurchasableProducts(storeSlug?: string) {
  return useQuery({
    queryKey: storefrontReviewKeys.purchasable(storeSlug),
    queryFn: async () =>
      (await getPurchasableProductsForReview(storeSlug)).data,
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
