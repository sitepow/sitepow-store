import { ALL_STORES } from '@/stores/use-store-filter'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  BulkImportProductsInput,
  CreateProductInput,
  GetProductsParams,
  bulkImportProducts,
  createProduct,
  deleteProduct,
  getProductById,
  getProductOptions,
  getProductQuota,
  getProducts,
  updateProduct,
} from '../product'
import { posProductKeys } from '../query-keys/pos/product'
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

export function useCreateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateProductInput) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.invalidateQueries({ queryKey: posProductKeys.all })
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.invalidateQueries({ queryKey: posProductKeys.all })
    },
  })
}

export function useProduct(id: string) {
  return useQuery(
    queryOptions({
      queryKey: productKeys.detail(id),
      queryFn: async () => {
        return await getProductById(id)
      },
      enabled: !!id,
    }),
  )
}

export function useUpdateProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateProductInput }) =>
      updateProduct(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.invalidateQueries({
        queryKey: productKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: posProductKeys.all })
    },
  })
}

export const useProductOptions = (storeId: string) => {
  return useQuery(
    queryOptions({
      queryKey: productKeys.options(storeId),
      queryFn: () => getProductOptions(storeId),
      enabled: !!storeId && storeId !== ALL_STORES,
    }),
  )
}

export function useProductQuota(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: productKeys.quota(storeId),
      queryFn: () => getProductQuota(storeId),
      enabled: !!storeId && storeId !== ALL_STORES,
    }),
  )
}

export function useBulkImportProducts() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: BulkImportProductsInput) => bulkImportProducts(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
      queryClient.invalidateQueries({ queryKey: posProductKeys.all })
      queryClient.invalidateQueries({
        queryKey: productKeys.quota(variables.storeId),
      })
    },
  })
}
