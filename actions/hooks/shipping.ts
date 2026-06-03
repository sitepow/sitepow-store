import { ShippingFormValues } from '@/zod/shipping'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { shippingKeys } from '../query-keys/shipping'
import {
  getStoreShippingSettings,
  updateStoreShippingSettings,
} from '../shipping'

export function useStoreShippingSettings(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: shippingKeys.settings(storeId),
      queryFn: async () => await getStoreShippingSettings(storeId),
      enabled: !!storeId,
    }),
  )
}

export function useUpdateShippingSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      data,
    }: {
      storeId: string
      data: ShippingFormValues
    }) => await updateStoreShippingSettings(storeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: shippingKeys.settings(variables.storeId),
      })
    },
  })
}
