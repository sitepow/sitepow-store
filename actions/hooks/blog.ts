import { queryOptions, useQuery } from '@tanstack/react-query'

import { getBlogs } from '../blog'
import { blogKeys } from '../query-keys/blog'

interface UseBlogsParams {
  storeId: string
  page?: number
  limit?: number
  search?: string
}

export function useBlogs({
  storeId,
  page = 1,
  limit = 10,
  search,
}: UseBlogsParams) {
  const filters = { storeId, page, limit, search }

  return useQuery(
    queryOptions({
      queryKey: blogKeys.list(filters),
      queryFn: async () => await getBlogs(filters),
      enabled: !!storeId,
      placeholderData: (prev) => prev,
    }),
  )
}
