import { ALL_BRANCHES } from '@/stores/use-branch-filter'
import { ALL_STORES } from '@/stores/use-store-filter'
import { ShippingFormValues } from '@/zod/shipping'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { shippingKeys } from '../query-keys/shipping'
import { storeKeys } from '../query-keys/store'
import {
  getStoreShippingSettings,
  updateStoreShippingSettings,
} from '../shipping'

export function useStoreShippingSettings(storeId: string, branchId: string) {
  return useQuery(
    queryOptions({
      queryKey: shippingKeys.settings(storeId, branchId),
      queryFn: async () => await getStoreShippingSettings(storeId, branchId),
      enabled:
        !!storeId &&
        storeId !== ALL_STORES &&
        !!branchId &&
        branchId !== ALL_BRANCHES,
    }),
  )
}

export function useUpdateShippingSettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      branchId,
      data,
    }: {
      storeId: string
      branchId: string
      data: ShippingFormValues
    }) => await updateStoreShippingSettings(storeId, branchId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: shippingKeys.settings(variables.storeId, variables.branchId),
      })
      queryClient.invalidateQueries({
        queryKey: storeKeys.setupStatus(variables.storeId),
      })
    },
  })
}
