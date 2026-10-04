import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  applyGlobalRatesToStore,
  getGlobalShippingRateMatrixMetadata,
  getGlobalShippingRateMatrixProvinces,
} from '@/actions/store/global-shipping-rate-matrix/actions'
import { globalShippingRateMatrixKeys } from '@/actions/store/global-shipping-rate-matrix/query-keys'
import { shippingKeys } from '@/actions/store/shipping/query-keys'

export function useGlobalShippingRateMatrixProvinces() {
  return useQuery(
    queryOptions({
      queryKey: globalShippingRateMatrixKeys.lists(),
      queryFn: () => getGlobalShippingRateMatrixProvinces(),
    }),
  )
}

export function useGlobalShippingMetadata(province: string) {
  return useQuery(
    queryOptions({
      queryKey: shippingKeys.matrix(province),
      queryFn: () => getGlobalShippingRateMatrixMetadata(province),
      enabled: !!province,
    }),
  )
}

export function useApplyGlobalRates() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      branchId,
      fromProvince,
    }: {
      storeId: string
      branchId: string
      fromProvince: string
    }) => await applyGlobalRatesToStore(storeId, branchId, fromProvince),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: shippingKeys.settings(variables.storeId, variables.branchId),
      })
    },
  })
}
