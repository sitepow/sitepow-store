import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  CreateCouponInput,
  UpdateCouponInput,
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
} from '@/actions/sales/coupon/actions'
import { couponKeys } from '@/actions/sales/coupon/query-keys'

interface UseCouponsParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

export function useCoupons({
  storeId,
  page = 1,
  limit = 10,
  search,
}: UseCouponsParams) {
  const filters = { storeId, page, limit, search }

  return useQuery(
    queryOptions({
      queryKey: couponKeys.list(filters),
      queryFn: async () => await getCoupons(filters),
      enabled: !!storeId,
      placeholderData: (previousData) => previousData,
    }),
  )
}

export function useCreateCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCouponInput) => await createCoupon(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all })
    },
  })
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateCouponInput
    }) => await updateCoupon(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all })
    },
  })
}

export function useDeleteCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => await deleteCoupon(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all })
    },
  })
}
