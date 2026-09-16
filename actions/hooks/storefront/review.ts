import { reviewKeys } from '@/actions/query-keys/review'
import { storefrontProductKeys } from '@/actions/query-keys/storefront/product'
import { storefrontReviewKeys } from '@/actions/query-keys/storefront/review'
import {
  CreateCustomerReviewParams,
  GetCustomerReviewsParams,
  GetStoreCustomerReviewsParams,
  GetStoreCustomerReviewsResponse,
  StoreReviewSummary,
  UpdateCustomerReviewParams,
  createCustomerReview,
  deleteCustomerReview,
  getCustomerReviews,
  getPurchasableProductsForReview,
  getStoreCustomerReviews,
  getStoreReviewSummary,
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

export function useStoreReviewSummary(
  storeId: string,
  initialData?: StoreReviewSummary,
) {
  return useQuery({
    queryKey: storefrontReviewKeys.storeSummary(storeId),
    queryFn: () => getStoreReviewSummary(storeId),
    initialData,
    enabled: !!storeId,
  })
}

export function useStoreCustomerReviews(
  params: GetStoreCustomerReviewsParams,
  initialData?: GetStoreCustomerReviewsResponse,
) {
  return useQuery({
    queryKey: storefrontReviewKeys.storeList(params.storeId, {
      page: params.page,
      limit: params.limit,
      rating: params.rating,
      hasMedia: params.hasMedia,
    }),
    queryFn: () => getStoreCustomerReviews(params),
    initialData,
    enabled: !!params.storeId,
  })
}
