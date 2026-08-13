import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { reviewKeys } from '../query-keys/review'
import {
  CreateReviewInput,
  UpdateReviewInput,
  createReview,
  deleteReview,
  getReviews,
  updateReview,
} from '../review'

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

export function useCreateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateReviewInput) => await createReview(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all })
    },
  })
}

export function useUpdateReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateReviewInput
    }) => await updateReview(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all })
    },
  })
}

export function useDeleteReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => await deleteReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all })
    },
  })
}
