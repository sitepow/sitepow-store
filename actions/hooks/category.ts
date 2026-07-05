import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  CreateCategoryInput,
  UpdateCategoryInput,
  createCategory,
  deleteCategory,
  getCategories,
  getCategory,
  getCategoryOptions,
  updateCategory,
} from '../category'
import { categoryKeys } from '../query-keys/category'

interface UseCategoryOptionsParams {
  storeId?: string
  search?: string
}

interface UseCategoriesParams {
  page?: number
  limit?: number
  search?: string
  storeId?: string
}

export function useCategories({
  page = 1,
  limit = 10,
  search,
  storeId,
}: UseCategoriesParams = {}) {
  const filters = { page, limit, search, storeId }

  return useQuery(
    queryOptions({
      queryKey: categoryKeys.list(filters),
      queryFn: async () => await getCategories(filters),
      placeholderData: (previousData) => previousData,
    }),
  )
}

export function useCategoryOptions(filters?: UseCategoryOptionsParams) {
  return useQuery(
    queryOptions({
      queryKey: categoryKeys.options(filters),
      queryFn: async () => await getCategoryOptions(filters),
    }),
  )
}

export function useCreateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateCategoryInput) =>
      await createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useUpdateCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      input,
    }: {
      id: string
      input: UpdateCategoryInput
    }) => await updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useDeleteCategory() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => await deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all })
    },
  })
}

export function useCategory(id: string) {
  return useQuery(
    queryOptions({
      queryKey: categoryKeys.detail(id),
      queryFn: async () => await getCategory(id),
      enabled: !!id,
    }),
  )
}
