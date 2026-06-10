import { storefrontProductKeys } from '@/actions/query-keys/storefront/product'
import {
  GetStorefrontProductsParams,
  getStorefrontProductDetail,
  getStorefrontProducts,
} from '@/actions/storefront/product'
import { queryOptions, useQuery } from '@tanstack/react-query'

export function useStorefrontProducts({
  storeSlug,
  page = 1,
  limit = 12,
  search,
  categorySlug,
}: GetStorefrontProductsParams) {
  const filters = { storeSlug, page, limit, search, categorySlug }

  return useQuery(
    queryOptions({
      queryKey: storefrontProductKeys.list(filters),
      queryFn: () => getStorefrontProducts(filters),
      placeholderData: (previousData) => previousData,
      enabled: !!storeSlug,
    }),
  )
}

export function useStorefrontProductDetail(
  storeSlug: string,
  productSlug: string,
) {
  return useQuery(
    queryOptions({
      queryKey: storefrontProductKeys.detail(storeSlug, productSlug),
      queryFn: () => getStorefrontProductDetail(storeSlug, productSlug),
      enabled: !!storeSlug && !!productSlug,
    }),
  )
}
