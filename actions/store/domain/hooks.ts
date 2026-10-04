import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  addStoreDomain,
  getStoreDomain,
  removeStoreDomain,
  verifyStoreDomain,
} from '@/actions/store/domain/actions'
import { domainKeys } from '@/actions/store/domain/query-keys'

export function useStoreDomain(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: domainKeys.detail(storeId),
      queryFn: async () => await getStoreDomain(storeId),
      enabled: !!storeId,
    }),
  )
}

export function useAddStoreDomain() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ storeId, domain }: { storeId: string; domain: string }) =>
      addStoreDomain(storeId, domain),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: domainKeys.detail(variables.storeId),
      })
    },
  })
}

export function useRemoveStoreDomain() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (storeId: string) => removeStoreDomain(storeId),
    onSuccess: (_, storeId) => {
      queryClient.invalidateQueries({
        queryKey: domainKeys.detail(storeId),
      })
    },
  })
}

export function useVerifyStoreDomain() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (storeId: string) => verifyStoreDomain(storeId),
    onSuccess: (_, storeId) => {
      queryClient.invalidateQueries({
        queryKey: domainKeys.detail(storeId),
      })
    },
  })
}
