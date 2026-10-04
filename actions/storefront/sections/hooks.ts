import { storefrontSectionsKeys } from '@/actions/storefront/sections/query-keys'
import { getStorefrontCategoriesProductsSections } from '@/actions/storefront/sections/actions'
import { queryOptions, useQuery } from '@tanstack/react-query'

export function useStorefrontCategoriesProductsSections(storeSlug: string) {
  return useQuery(
    queryOptions({
      queryKey: storefrontSectionsKeys.categoriesProductsSections(storeSlug),
      queryFn: () => getStorefrontCategoriesProductsSections(storeSlug),
    }),
  )
}
