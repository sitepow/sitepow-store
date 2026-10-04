import { QueryClient } from '@tanstack/react-query'

import { CacheKeys } from '@/lib/cache/keys'

export function invalidateClientProductQueries(
  queryClient: QueryClient,
  storeId: string,
  productId?: string,
) {
  if (!storeId) return

  queryClient.invalidateQueries({
    queryKey: CacheKeys.product.lists(storeId).queryKey,
  })

  if (productId) {
    queryClient.invalidateQueries({
      queryKey: CacheKeys.product.detail(storeId, productId).queryKey,
    })
  }

  queryClient.invalidateQueries({
    queryKey: ['tenant', storeId, 'pos', 'products'],
  })

  queryClient.invalidateQueries({
    predicate: (query) => {
      const key = query.queryKey
      if (key[0] === 'products' && key[1] === 'list') {
        const filter = key[2] as { storeId?: string } | undefined
        return !filter?.storeId || filter.storeId === storeId
      }
      if (productId && key[0] === 'products' && key[1] === 'detail' && key[2] === productId) {
        return true
      }
      return false
    },
  })
}
