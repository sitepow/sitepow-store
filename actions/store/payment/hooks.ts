import { ALL_STORES } from '@/stores/use-store-filter'
import { BankAccountFormValues, PaymentSettingFormValues } from '@/zod/store/payment-settings'
import {
  queryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'

import {
  checkPaymentSettingStatus,
  createBankAccount,
  deleteBankAccount,
  getBankAccount,
  getPaymentSetting,
  updateBankAccount,
  upsertPaymentSetting,
} from '@/actions/store/payment/actions'
import { paymentKeys } from '@/actions/store/payment/query-keys'
import { storeKeys } from '@/actions/store/management/query-keys'

export function usePaymentSetting(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: paymentKeys.settings(storeId),
      queryFn: async () => await getPaymentSetting(storeId),
      enabled: !!storeId && storeId !== ALL_STORES,
      placeholderData: (prev) => prev,
    }),
  )
}

export function useUpsertPaymentSetting() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      data,
    }: {
      storeId: string
      data: PaymentSettingFormValues
    }) => await upsertPaymentSetting(storeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.settings(variables.storeId),
      })
      queryClient.invalidateQueries({
        queryKey: storeKeys.setupStatus(variables.storeId),
      })
    },
  })
}

export function useCreateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      storeId,
      data,
    }: {
      storeId: string
      data: BankAccountFormValues
    }) => await createBankAccount(storeId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.settings(variables.storeId),
      })
      queryClient.invalidateQueries({
        queryKey: storeKeys.setupStatus(variables.storeId),
      })
    },
  })
}

export function useUpdateBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      storeId: string
      data: BankAccountFormValues
    }) => await updateBankAccount(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.settings(variables.storeId),
      })
      queryClient.invalidateQueries({
        queryKey: storeKeys.setupStatus(variables.storeId),
      })
    },
  })
}

export function useDeleteBankAccount() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id }: { id: string; storeId: string }) =>
      await deleteBankAccount(id),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: paymentKeys.settings(variables.storeId),
      })
      queryClient.invalidateQueries({
        queryKey: storeKeys.setupStatus(variables.storeId),
      })
    },
  })
}

export function useBankAccount(id?: string) {
  return useQuery(
    queryOptions({
      queryKey: paymentKeys.bankAccount(id ?? ''),
      queryFn: async () => await getBankAccount(id!),
      enabled: !!id,
    }),
  )
}

export function usePaymentSettingStatus(storeId: string) {
  return useQuery(
    queryOptions({
      queryKey: paymentKeys.status(storeId),
      queryFn: async () => await checkPaymentSettingStatus(storeId),
      enabled: !!storeId && storeId !== ALL_STORES,
      placeholderData: (prev) => prev,
    }),
  )
}
