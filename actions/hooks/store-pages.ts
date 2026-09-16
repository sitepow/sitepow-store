import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { storePagesKeys } from '../query-keys/store-pages'
import {
  UpdateStorePagesInput,
  getStorePages,
  updateStorePages,
} from '../store-pages'

export function useStorePages(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: storePagesKeys.detail(storeId),
      queryFn: async () => await getStorePages(storeId),
      enabled: !!storeId,
    }),
  )
}

export function useUpdateStorePages() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      input,
    }: {
      storeId: string
      input: UpdateStorePagesInput
    }) => await updateStorePages(storeId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: storePagesKeys.all })
      queryClient.invalidateQueries({
        queryKey: storePagesKeys.detail(variables.storeId),
      })
    },
  })
}
