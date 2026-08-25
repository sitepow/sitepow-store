'use client'

import { orderKeys } from '@/actions/query-keys/order'
import { posProductKeys } from '@/actions/query-keys/pos/product'
import { resellerKeys } from '@/actions/query-keys/reseller'
import {
  acceptResellerStock,
  allocateResellerStock,
  createResellerAgreement,
  createResellerPOSOrder,
  createResellerPayout,
  getResellerAgreements,
  getResellerPayoutSummary,
  getResellerStocks,
  returnResellerStock,
} from '@/actions/reseller'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

export function useCreateResellerPOSOrder() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createResellerPOSOrder,
    onSuccess: async (res) => {
      if (res.success) {
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: resellerKeys.stocks() }),
          queryClient.invalidateQueries({ queryKey: posProductKeys.all }),
          queryClient.invalidateQueries({ queryKey: orderKeys.all }),
        ])
      }
    },
  })
}

export function useResellerStocks(agreementId: string) {
  return useQuery({
    queryKey: resellerKeys.stockList(agreementId),
    queryFn: () => getResellerStocks(agreementId),
    enabled: !!agreementId,
  })
}

export function useResellerPayoutSummary(agreementId: string) {
  return useQuery({
    queryKey: resellerKeys.summary(agreementId),
    queryFn: () => getResellerPayoutSummary(agreementId),
    enabled: !!agreementId,
  })
}

export function useAllocateResellerStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: allocateResellerStock,
    onSuccess: async (res, variables) => {
      if (res.success) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: resellerKeys.stockList(variables.agreementId),
          }),
        ])
      }
    },
  })
}

export function useAcceptResellerStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: acceptResellerStock,
    onSuccess: async (res, variables) => {
      if (res.success) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: resellerKeys.stockList(variables.agreementId),
          }),
          queryClient.invalidateQueries({
            queryKey: resellerKeys.summary(variables.agreementId),
          }),
        ])
      }
    },
  })
}

export function useCreateResellerPayout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createResellerPayout,
    onSuccess: async (res, variables) => {
      if (res.success) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: resellerKeys.payoutList(variables.agreementId),
          }),
          queryClient.invalidateQueries({
            queryKey: resellerKeys.summary(variables.agreementId),
          }),
        ])
      }
    },
  })
}

export function useResellerAgreements(storeId: string) {
  return useQuery({
    queryKey: resellerKeys.agreementList(storeId),
    queryFn: () => getResellerAgreements(storeId),
    enabled: !!storeId,
  })
}

export function useCreateResellerAgreement() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createResellerAgreement,
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({
          queryKey: resellerKeys.all,
        })
      }
    },
  })
}

export function useReturnResellerStock() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: returnResellerStock,
    onSuccess: async (res, variables) => {
      if (res.success) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: resellerKeys.stockList(variables.agreementId),
          }),
          queryClient.invalidateQueries({ queryKey: posProductKeys.all }),
        ])
      }
    },
  })
}
