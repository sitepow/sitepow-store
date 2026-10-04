import { StoreProfileFormValues } from '@/zod/store/store-profile'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { storeKeys } from '@/actions/store/management/query-keys'
import { storeProfileKeys } from '@/actions/store/profile/query-keys'
import { getStoreProfile, updateStoreProfile } from '@/actions/store/profile/actions'

export function useStoreProfile(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: storeProfileKeys.detail(storeId),
      queryFn: async () => await getStoreProfile(storeId),
      enabled: !!storeId,
    }),
  )
}

export function useUpdateStoreProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      input,
    }: {
      storeId: string
      input: StoreProfileFormValues
    }) => await updateStoreProfile(storeId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeProfileKeys.all })
      queryClient.invalidateQueries({ queryKey: storeKeys.options() })
    },
  })
}
