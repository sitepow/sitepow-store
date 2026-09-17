import {
  SaveSettlementInput,
  UpsertPartnerInput,
  closeMonthlySettlement,
  deleteProfitPartner,
  getMonthlySettlement,
  getMonthlySettlementHistory,
  getProfitPartners,
  getStorePotentialPartners,
  saveMonthlySettlement,
  toggleProfitPartnerStatus,
  updatePayoutStatus,
  upsertProfitPartner,
} from '@/actions/profit-sharing'
import { PayoutStatus } from '@/generated/prisma/enums'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { profitSharingKeys } from '../query-keys/profit-sharing'

export function useProfitPartners(storeId: string) {
  return useQuery({
    queryKey: profitSharingKeys.partners(storeId),
    queryFn: () => getProfitPartners(storeId),
    enabled: !!storeId && storeId !== 'all',
  })
}

export function useStorePotentialPartners(storeId: string) {
  return useQuery({
    queryKey: profitSharingKeys.potentialPartners(storeId),
    queryFn: () => getStorePotentialPartners(storeId),
    enabled: !!storeId && storeId !== 'all',
  })
}

export function useUpsertProfitPartner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpsertPartnerInput) => upsertProfitPartner(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: profitSharingKeys.partners(variables.storeId),
      })
    },
  })
}

export function useDeleteProfitPartner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, storeId }: { id: string; storeId: string }) =>
      deleteProfitPartner(id, storeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: profitSharingKeys.partners(variables.storeId),
      })
    },
  })
}

export function useToggleProfitPartnerStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, storeId }: { id: string; storeId: string }) =>
      toggleProfitPartnerStatus(id, storeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: profitSharingKeys.partners(variables.storeId),
      })
    },
  })
}

export function useMonthlySettlement(storeId: string, period: string) {
  return useQuery({
    queryKey: profitSharingKeys.settlement(storeId, period),
    queryFn: () => getMonthlySettlement(storeId, period),
    enabled: !!storeId && storeId !== 'all' && !!period,
  })
}

export function useMonthlySettlementHistory(storeId: string) {
  return useQuery({
    queryKey: profitSharingKeys.history(storeId),
    queryFn: () => getMonthlySettlementHistory(storeId),
    enabled: !!storeId && storeId !== 'all',
  })
}

export function useSaveMonthlySettlement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveSettlementInput) => saveMonthlySettlement(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: profitSharingKeys.settlement(
          variables.storeId,
          variables.period,
        ),
      })
      queryClient.invalidateQueries({
        queryKey: profitSharingKeys.history(variables.storeId),
      })
    },
  })
}

export function useUpdatePayoutStatus(storeId?: string, period?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      payoutId,
      status,
      details,
    }: {
      payoutId: string
      status: PayoutStatus
      details?: {
        paidAt?: string | null
        slipImage?: string | null
        paymentNote?: string | null
      }
    }) => updatePayoutStatus(payoutId, status, details),
    onSuccess: () => {
      if (storeId && period) {
        queryClient.invalidateQueries({
          queryKey: profitSharingKeys.settlement(storeId, period),
        })
      }
      if (storeId) {
        queryClient.invalidateQueries({
          queryKey: profitSharingKeys.history(storeId),
        })
      }
    },
  })
}

export function useCloseMonthlySettlement() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      settlementId,
      storeId,
      isClosed = true,
    }: {
      settlementId: string
      storeId: string
      isClosed?: boolean
    }) => closeMonthlySettlement(settlementId, storeId, isClosed),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: profitSharingKeys.all,
      })
    },
  })
}
