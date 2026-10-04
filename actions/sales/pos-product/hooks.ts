import { getPOSProducts, getResellerPOSProducts } from '@/actions/sales/pos-product/actions'
import { posProductKeys } from '@/actions/sales/pos-product/query-keys'
import { queryOptions, useQuery } from '@tanstack/react-query'

export interface UsePOSProductsParams {
  storeId: string
  branchId: string
  search?: string
  categoryId?: string
}

export interface UseResellerPOSProductsParams {
  agreementId: string
  branchId: string
  search?: string
  categoryId?: string
}

export function usePOSProducts({
  storeId,
  branchId,
  search,
  categoryId,
}: UsePOSProductsParams) {
  return useQuery(
    queryOptions({
      queryKey: posProductKeys.list(storeId, branchId, search, categoryId),
      queryFn: async () => {
        const res = await getPOSProducts({
          storeId,
          branchId,
          search,
          categoryId,
        })

        return res.data ?? []
      },
      enabled: Boolean(storeId && branchId),
    }),
  )
}

export function useResellerPOSProducts({
  agreementId,
  branchId,
  search,
  categoryId,
}: UseResellerPOSProductsParams) {
  return useQuery(
    queryOptions({
      queryKey: posProductKeys.resellerList(
        agreementId,
        branchId,
        search,
        categoryId,
      ),
      queryFn: async () => {
        const res = await getResellerPOSProducts({
          agreementId,
          branchId,
          search,
          categoryId,
        })

        if (!res.success) {
          return []
        }

        return res.data ?? []
      },
      enabled: Boolean(agreementId && branchId),
    }),
  )
}
