import { storefrontCategoryKeys } from '@/actions/query-keys/storefront/category'
import {
  GetStorefrontCategoriesParams,
  getStorefrontCategories,
  getStorefrontCategoryOptions,
} from '@/actions/storefront/category'
import { queryOptions, useQuery } from '@tanstack/react-query'

export function useStorefrontCategories({
  storeSlug,
  search,
}: GetStorefrontCategoriesParams) {
  const filters = { storeSlug, search }

  return useQuery(
    queryOptions({
      queryKey: storefrontCategoryKeys.list(filters),
      queryFn: () => getStorefrontCategories(filters),
      enabled: !!storeSlug,
    }),
  )
}

export function useStorefrontCategoryOptions(storeSlug: string) {
  return useQuery(
    queryOptions({
      queryKey: storefrontCategoryKeys.options(storeSlug),
      queryFn: () => getStorefrontCategoryOptions(storeSlug),
      enabled: !!storeSlug,
    }),
  )
}
