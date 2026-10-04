import { getAllPermissions, getRoleOptions } from '@/actions/store/role/actions'
import { queryOptions, useQuery } from '@tanstack/react-query'

import { roleKeys } from '@/actions/store/role/query-keys'

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

export function usePermissions() {
  return useQuery(
    queryOptions({
      queryKey: roleKeys.permissions(),
      queryFn: async () => {
        const res = await getAllPermissions()
        return res ?? []
      },
    }),
  )
}
