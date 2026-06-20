'use client'

import { storefrontKeys } from '@/actions/query-keys/storefront/sections'
import { getStorefrontCategoriesProductsSections } from '@/actions/storefront/sections'
import { queryOptions, useQuery } from '@tanstack/react-query'

export function useStorefrontCategoriesProductsSections(storeSlug: string) {
  return useQuery(
    queryOptions({
      queryKey: storefrontKeys.categoriesProductsSections(storeSlug),
      queryFn: () => getStorefrontCategoriesProductsSections(storeSlug),
    }),
  )
}
