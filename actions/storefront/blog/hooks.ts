import { storefrontBlogKeys } from '@/actions/storefront/blog/query-keys'
import {
  GetStorefrontBlogsParams,
  getStorefrontBlogDetail,
  getStorefrontBlogs,
} from '@/actions/storefront/blog/actions'
import { queryOptions, useQuery } from '@tanstack/react-query'

export function useStorefrontBlogs({
  storeSlug,
  page = 1,
  limit = 9,
  search,
}: GetStorefrontBlogsParams) {
  const filters = { storeSlug, page, limit, search }

  return useQuery(
    queryOptions({
      queryKey: storefrontBlogKeys.list(filters),
      queryFn: () => getStorefrontBlogs(filters),
      placeholderData: (prev) => prev,
      enabled: !!storeSlug,
    }),
  )
}

export function useStorefrontBlogDetail(storeSlug: string, blogSlug: string) {
  return useQuery(
    queryOptions({
      queryKey: storefrontBlogKeys.detail(storeSlug, blogSlug),
      queryFn: () => getStorefrontBlogDetail(storeSlug, blogSlug),
      enabled: !!storeSlug && !!blogSlug,
    }),
  )
}
