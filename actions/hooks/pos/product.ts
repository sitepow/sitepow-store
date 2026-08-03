import { getPOSProducts } from '@/actions/pos/product'
import { posProductKeys } from '@/actions/query-keys/pos/product'
import { queryOptions, useQuery } from '@tanstack/react-query'

export function usePOSProducts({
  storeId,
  branchId,
  search,
  categoryId,
}: {
  storeId: string
  branchId: string
  search?: string
  categoryId?: string
}) {
  return useQuery(
    queryOptions({
      queryKey: posProductKeys.list(storeId, branchId, search, categoryId),
      queryFn: async () => {
        const res = await getPOSProducts({
          storeId,
          branchId,
          search,
          categoryId,
        })

        return res.data ?? []
      },
      enabled: Boolean(storeId && branchId),
    }),
  )
}
