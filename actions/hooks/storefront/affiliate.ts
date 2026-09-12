'use client'

import { storefrontAffiliateKeys } from '@/actions/query-keys/storefront/affiliate'
import {
  getCustomerAffiliateDashboard,
  getStorefrontAffiliateProducts,
  requestAffiliatePayout,
  updateCustomerAffiliateBank,
} from '@/actions/storefront/affiliate'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export function useCustomerAffiliateDashboard(storeSlug?: string) {
  return useQuery(
    queryOptions({
      queryKey: storefrontAffiliateKeys.dashboard(storeSlug ?? ''),
      queryFn: async () => {
        if (!storeSlug) return null
        const res = await getCustomerAffiliateDashboard(storeSlug)
        return res.data ?? null
      },
      enabled: Boolean(storeSlug),
    }),
  )
}

export function useStorefrontAffiliateProducts(
  storeSlug?: string,
  search?: string,
) {
  return useQuery(
    queryOptions({
      queryKey: storefrontAffiliateKeys.products(storeSlug ?? '', search),
      queryFn: async () => {
        if (!storeSlug) return []
        const res = await getStorefrontAffiliateProducts(storeSlug, search)
        return res.data ?? []
      },
      enabled: Boolean(storeSlug),
    }),
  )
}

export function useRequestAffiliatePayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      storeSlug,
      input,
    }: {
      storeSlug: string
      input: {
        amount: number
        bankName?: string
        bankAccountNo?: string
        bankAccountName?: string
        promptPayNumber?: string
      }
    }) => requestAffiliatePayout(storeSlug, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: storefrontAffiliateKeys.dashboard(variables.storeSlug),
      })
    },
  })
}

export function useUpdateCustomerAffiliateBank() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      storeSlug,
      input,
    }: {
      storeSlug: string
      input: {
        bankName?: string
        bankAccountNo?: string
        bankAccountName?: string
        promptPayNumber?: string
      }
    }) => updateCustomerAffiliateBank(storeSlug, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: storefrontAffiliateKeys.dashboard(variables.storeSlug),
      })
    },
  })
}
