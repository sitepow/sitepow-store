import { TaxSettingFormValues } from '@/zod/store/tax-settings'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { taxKeys } from '@/actions/store/tax/query-keys'
import { getTaxSetting, updateTaxSetting } from '@/actions/store/tax/actions'

export function useTaxSetting(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: taxKeys.settings(storeId),
      queryFn: () => getTaxSetting(storeId),
      enabled: !!storeId,
    }),
  )
}

export function useUpdateTaxSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { storeId: string; data: TaxSettingFormValues }) =>
      updateTaxSetting(vars.storeId, vars.data),
    onSuccess: (_, vars) =>
      queryClient.invalidateQueries({
        queryKey: taxKeys.settings(vars.storeId),
      }),
  })
}
