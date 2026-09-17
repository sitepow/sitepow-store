import {
  SaveMonthlyPayrollInput,
  UpdatePayrollItemPayoutInput,
  UpsertEmployeeSalaryConfigInput,
  closeMonthlyPayroll,
  deleteEmployeeSalaryConfig,
  getEmployeeSalaryConfigs,
  getMonthlyPayroll,
  getMonthlyPayrollHistory,
  getStoreAvailableEmployees,
  saveMonthlyPayroll,
  syncEmployeesFromStore,
  syncPayrollToExpense,
  toggleEmployeeSalaryConfigStatus,
  updatePayrollItemPayout,
  upsertEmployeeSalaryConfig,
} from '@/actions/payroll'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { payrollKeys } from '../query-keys/payroll'

export function useEmployeeSalaryConfigs(storeId: string) {
  return useQuery({
    queryKey: payrollKeys.configs(storeId),
    queryFn: () => getEmployeeSalaryConfigs(storeId),
    enabled: !!storeId && storeId !== 'all',
  })
}

export function useStoreAvailableEmployees(storeId: string) {
  return useQuery({
    queryKey: payrollKeys.availableEmployees(storeId),
    queryFn: () => getStoreAvailableEmployees(storeId),
    enabled: !!storeId && storeId !== 'all',
  })
}

export function useUpsertEmployeeSalaryConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpsertEmployeeSalaryConfigInput) =>
      upsertEmployeeSalaryConfig(input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: payrollKeys.configs(variables.storeId),
      })
      queryClient.invalidateQueries({
        queryKey: payrollKeys.all,
      })
    },
  })
}

export function useDeleteEmployeeSalaryConfig() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, storeId }: { id: string; storeId: string }) =>
      deleteEmployeeSalaryConfig(id, storeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: payrollKeys.configs(variables.storeId),
      })
      queryClient.invalidateQueries({
        queryKey: payrollKeys.all,
      })
    },
  })
}

export function useToggleEmployeeSalaryConfigStatus() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, storeId }: { id: string; storeId: string }) =>
      toggleEmployeeSalaryConfigStatus(id, storeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: payrollKeys.configs(variables.storeId),
      })
      queryClient.invalidateQueries({
        queryKey: payrollKeys.all,
      })
    },
  })
}

export function useSyncEmployeesFromStore() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (storeId: string) => syncEmployeesFromStore(storeId),
    onSuccess: (_, storeId) => {
      queryClient.invalidateQueries({
        queryKey: payrollKeys.configs(storeId),
      })
      queryClient.invalidateQueries({
        queryKey: payrollKeys.all,
      })
    },
  })
}

export function useMonthlyPayroll(storeId: string, period: string) {
  return useQuery({
    queryKey: payrollKeys.monthly(storeId, period),
    queryFn: () => getMonthlyPayroll(storeId, period),
    enabled: !!storeId && storeId !== 'all' && !!period,
  })
}

export function useMonthlyPayrollHistory(storeId: string) {
  return useQuery({
    queryKey: payrollKeys.history(storeId),
    queryFn: () => getMonthlyPayrollHistory(storeId),
    enabled: !!storeId && storeId !== 'all',
  })
}

export function useSaveMonthlyPayroll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: SaveMonthlyPayrollInput) => saveMonthlyPayroll(input),
    onSuccess: (res, variables) => {
      queryClient.invalidateQueries({
        queryKey: payrollKeys.monthly(variables.storeId, variables.period),
      })
      queryClient.invalidateQueries({
        queryKey: payrollKeys.history(variables.storeId),
      })
      queryClient.invalidateQueries({
        queryKey: ['expenses'],
      })
    },
  })
}

export function useUpdatePayrollItemPayout(storeId: string, period: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: UpdatePayrollItemPayoutInput) =>
      updatePayrollItemPayout(input),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: payrollKeys.monthly(storeId, period),
      })
      queryClient.invalidateQueries({
        queryKey: payrollKeys.history(storeId),
      })
    },
  })
}

export function useSyncPayrollToExpense() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      payrollId,
      storeId,
      period,
    }: {
      payrollId: string
      storeId: string
      period: string
    }) => syncPayrollToExpense(payrollId, storeId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: payrollKeys.monthly(variables.storeId, variables.period),
      })
      queryClient.invalidateQueries({
        queryKey: payrollKeys.history(variables.storeId),
      })
      queryClient.invalidateQueries({
        queryKey: ['expenses'],
      })
    },
  })
}

export function useCloseMonthlyPayroll() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      payrollId,
      storeId,
      isClosed,
      autoRecordExpense,
      period,
    }: {
      payrollId: string
      storeId: string
      isClosed: boolean
      autoRecordExpense?: boolean
      period: string
    }) => closeMonthlyPayroll(payrollId, storeId, isClosed, autoRecordExpense),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: payrollKeys.monthly(variables.storeId, variables.period),
      })
      queryClient.invalidateQueries({
        queryKey: payrollKeys.history(variables.storeId),
      })
      queryClient.invalidateQueries({
        queryKey: ['expenses'],
      })
    },
  })
}
