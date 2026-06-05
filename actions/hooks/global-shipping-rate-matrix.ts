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
} from '../global-shipping-rate-matrix'
import { globalShippingRateMatrixKeys } from '../query-keys/global-shipping-rate-matrix'
import { shippingKeys } from '../query-keys/shipping'

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
