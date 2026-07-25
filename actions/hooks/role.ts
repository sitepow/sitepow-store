'use client'

import { getRoleOptions } from '@/actions/role'
import { queryOptions, useQuery } from '@tanstack/react-query'

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
