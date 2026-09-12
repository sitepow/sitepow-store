'use client'

import {
  UpdateStoreAffiliateSettingInput,
  getMerchantAffiliatePayouts,
  getMerchantAffiliateReferrals,
  getMerchantAffiliateStats,
  getMerchantAffiliates,
  getStoreAffiliateSetting,
  processAffiliatePayout,
  updateAffiliateReferralStatus,
  updateStoreAffiliateSetting,
} from '@/actions/affiliate'
import { affiliateKeys } from '@/actions/query-keys/affiliate'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

export function useStoreAffiliateSetting(storeId?: string) {
  return useQuery(
    queryOptions({
      queryKey: affiliateKeys.merchantSettings(storeId ?? ''),
      queryFn: async () => {
        if (!storeId) return null
        const res = await getStoreAffiliateSetting(storeId)
        return res.data ?? null
      },
      enabled: Boolean(storeId),
    }),
  )
}

export function useUpdateStoreAffiliateSetting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      storeId,
      input,
    }: {
      storeId: string
      input: UpdateStoreAffiliateSettingInput
    }) => updateStoreAffiliateSetting(storeId, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: affiliateKeys.merchantSettings(variables.storeId),
      })
      queryClient.invalidateQueries({
        queryKey: affiliateKeys.merchantStats(variables.storeId),
      })
    },
  })
}

export function useMerchantAffiliateStats(storeId?: string) {
  return useQuery(
    queryOptions({
      queryKey: affiliateKeys.merchantStats(storeId ?? ''),
      queryFn: async () => {
        if (!storeId) return null
        const res = await getMerchantAffiliateStats(storeId)
        return res.data ?? null
      },
      enabled: Boolean(storeId),
    }),
  )
}

export function useMerchantAffiliates(
  storeId?: string,
  params?: { search?: string; page?: number; limit?: number },
) {
  return useQuery(
    queryOptions({
      queryKey: affiliateKeys.merchantAffiliates(storeId ?? '', params),
      queryFn: async () => {
        if (!storeId) {
          return {
            data: [],
            meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
          }
        }
        return getMerchantAffiliates(storeId, params)
      },
      placeholderData: (prev) => prev,
      enabled: Boolean(storeId),
    }),
  )
}

export function useMerchantAffiliateReferrals(
  storeId?: string,
  params?: { status?: string; page?: number; limit?: number },
) {
  return useQuery(
    queryOptions({
      queryKey: affiliateKeys.merchantReferrals(storeId ?? '', params),
      queryFn: async () => {
        if (!storeId) {
          return {
            data: [],
            meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
          }
        }
        return getMerchantAffiliateReferrals(storeId, params)
      },
      placeholderData: (prev) => prev,
      enabled: Boolean(storeId),
    }),
  )
}

export function useMerchantAffiliatePayouts(
  storeId?: string,
  params?: { status?: string; page?: number; limit?: number },
) {
  return useQuery(
    queryOptions({
      queryKey: affiliateKeys.merchantPayouts(storeId ?? '', params),
      queryFn: async () => {
        if (!storeId) {
          return {
            data: [],
            meta: { page: 1, limit: 20, totalItems: 0, totalPages: 0 },
          }
        }
        return getMerchantAffiliatePayouts(storeId, params)
      },
      placeholderData: (prev) => prev,
      enabled: Boolean(storeId),
    }),
  )
}

export function useProcessAffiliatePayout() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      payoutId,
      input,
    }: {
      payoutId: string
      input: {
        status: 'PAID' | 'REJECTED'
        paymentProof?: string
        note?: string
      }
    }) => processAffiliatePayout(payoutId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.all })
    },
  })
}

export function useUpdateAffiliateReferralStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      referralId,
      status,
    }: {
      referralId: string
      status: 'APPROVED' | 'REJECTED'
    }) => updateAffiliateReferralStatus(referralId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: affiliateKeys.all })
    },
  })
}
