import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  UpdateLoyaltySettingsInput,
  getCustomerPoints,
  getLoyaltySettings,
  updateLoyaltySettings,
} from '@/actions/store/loyalty/actions'
import { loyaltyKeys } from '@/actions/store/loyalty/query-keys'

export function useLoyaltySettings(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: loyaltyKeys.settings(storeId),
      queryFn: async () => await getLoyaltySettings(storeId),
      enabled: !!storeId,
    }),
  )
}

export function useUpdateLoyaltySettings() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      input,
    }: {
      storeId: string
      input: UpdateLoyaltySettingsInput
    }) => await updateLoyaltySettings(storeId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: loyaltyKeys.settings(variables.storeId),
      })
    },
  })
}

export function useCustomerPoints({
  storeId,
  page = 1,
  limit = 10,
  search,
}: {
  storeId: string
  page?: number
  limit?: number
  search?: string
}) {
  const filters = { storeId, page, limit, search }

  return useQuery(
    queryOptions({
      queryKey: loyaltyKeys.customers(filters),
      queryFn: async () => await getCustomerPoints(filters),
      enabled: !!storeId,
      placeholderData: (previousData) => previousData,
    }),
  )
}
