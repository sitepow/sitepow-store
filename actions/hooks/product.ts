import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  CreateProductInput,
  GetProductsParams,
  createProduct,
  deleteProduct,
  getProducts,
} from '../product'
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
    },
  })
}

export function useDeleteProduct() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    },
  })
}
