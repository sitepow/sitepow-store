import { TaxSettingFormValues } from '@/zod/tax'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { taxKeys } from '../query-keys/tax'
import { getTaxSetting, updateTaxSetting } from '../tax'

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
