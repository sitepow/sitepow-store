import { ALL_BRANCHES } from '@/stores/merchant/use-branch-filter'
import { ALL_STORES } from '@/stores/merchant/use-store-filter'
import { ShippingFormValues } from '@/zod/store/shipping-settings'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { shippingKeys } from '@/actions/store/shipping/query-keys'
import { storeKeys } from '@/actions/store/management/query-keys'
import {
  getStoreShippingSettings,
  updateStoreShippingSettings,
} from '@/actions/store/shipping/actions'

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
