import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  applyGlobalRatesToStore,
  getGlobalShippingRateMatrixMetadata,
} from '../global-shipping-rate-matrix'
import { shippingKeys } from '../query-keys/shipping'

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
      fromProvince,
    }: {
      storeId: string
      fromProvince: string
    }) => await applyGlobalRatesToStore(storeId, fromProvince),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: shippingKeys.settings(variables.storeId),
      })
    },
  })
}
