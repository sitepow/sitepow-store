'use client'

import { createRole, getRoleOptions } from '@/actions/role'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import { roleKeys } from '../query-keys/role'

export function useRoleOptions(storeId?: string) {
  return useQuery(
    queryOptions({
      queryKey: roleKeys.options(storeId),
      queryFn: async () => {
        if (!storeId) return []
        const res = await getRoleOptions(storeId)
        return res ?? []
      },
      enabled: !!storeId,
    }),
  )
}

export function useCreateRole() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: roleKeys.all,
      })
    },
  })
}
