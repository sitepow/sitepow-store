import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  CreateBlogInput,
  GetBlogsParams,
  createBlog,
  deleteBlog,
  getBlogById,
  getBlogs,
  updateBlog,
} from '../blog'
import { blogKeys } from '../query-keys/blog'

export function useBlogs({
  storeId,
  page = 1,
  limit = 10,
  search,
}: GetBlogsParams) {
  const filters = { storeId, page, limit, search }

  return useQuery(
    queryOptions({
      queryKey: blogKeys.list(filters),
      queryFn: async () => await getBlogs(filters),
      placeholderData: (previousData) => previousData,
      enabled: !!storeId,
    }),
  )
}

export function useBlog(id: string) {
  return useQuery(
    queryOptions({
      queryKey: blogKeys.detail(id),
      queryFn: async () => {
        return await getBlogById(id)
      },
      enabled: !!id,
    }),
  )
}

export function useCreateBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateBlogInput) => createBlog(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
  })
}

export function useUpdateBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateBlogInput }) =>
      updateBlog(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
      queryClient.invalidateQueries({
        queryKey: blogKeys.detail(variables.id),
      })
    },
  })
}

export function useDeleteBlog() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteBlog(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: blogKeys.all })
    },
  })
}
