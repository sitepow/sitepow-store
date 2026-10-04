import { QueryClient } from '@tanstack/react-query'

import { CacheKeys } from '@/lib/cache/keys'

export function invalidateClientInventoryQueries(
  queryClient: QueryClient,
  storeId?: string,
  branchId?: string,
) {
  if (storeId) {
    queryClient.invalidateQueries({
      queryKey: CacheKeys.inventory.lists(storeId).queryKey,
    })

    if (branchId) {
      queryClient.invalidateQueries({
        queryKey: CacheKeys.inventory.byBranch(storeId, branchId).queryKey,
      })
      queryClient.invalidateQueries({
        queryKey: ['tenant', storeId, 'pos', 'branch', branchId],
      })
    }
  }

  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey
      if (key[0] === 'inventory' && key[1] === 'list') {
        if (!storeId) return true
        const filter = key[2] as { storeId?: string; branchId?: string } | undefined
        const matchStore = !filter?.storeId || filter.storeId === storeId
        const matchBranch = !branchId || !filter?.branchId || filter.branchId === branchId
        return matchStore && matchBranch
      }
      return false
    },
  })
}
