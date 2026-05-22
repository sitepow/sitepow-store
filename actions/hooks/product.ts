import { queryOptions, useQuery } from '@tanstack/react-query'

import { GetProductsParams, getProducts } from '../product'
import { productKeys } from '../query-keys/product'

export function useProducts({
  storeId,
  page = 1,
  limit = 10,
  search,
  categoryId,
}: GetProductsParams) {
  const filters = { storeId, page, limit, search, categoryId }

  return useQuery(
    queryOptions({
      queryKey: productKeys.list(filters),
      queryFn: async () => await getProducts(filters),
      placeholderData: (previousData) => previousData,
      enabled: !!storeId,
    }),
  )
}
