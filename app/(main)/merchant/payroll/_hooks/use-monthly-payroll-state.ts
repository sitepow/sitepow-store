'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import {
  useCloseMonthlyPayroll,
  useMonthlyPayroll,
  useSaveMonthlyPayroll,
  useSyncPayrollToExpense,
} from '@/actions/hooks/payroll'
import { MonthlyPayrollItemRecord } from '@/types/payroll'

interface UseMonthlyPayrollStateParams {
  storeId: string
}

export function useMonthlyPayrollState({
  storeId,
}: UseMonthlyPayrollStateParams) {
  const t = useTranslations('merchant.payroll')

  const currentYear = new Date().getFullYear()
  const currentMonth = new Date().getMonth() + 1
  const defaultPeriod = `${currentYear}-${String(currentMonth).padStart(2, '0')}`

  const [period, setPeriod] = useState<string>(defaultPeriod)

  const { data: res, isLoading, refetch } = useMonthlyPayroll(storeId, period)
  const saveMutation = useSaveMonthlyPayroll()
  const syncExpenseMutation = useSyncPayrollToExpense()
  const closeMutation = useCloseMonthlyPayroll()

  const payroll = res?.data

  const [items, setItems] = useState<MonthlyPayrollItemRecord[]>([])
  const [selectedSlipItem, setSelectedSlipItem] =
    useState<MonthlyPayrollItemRecord | null>(null)
  const [slipDialogOpen, setSlipDialogOpen] = useState(false)
  const [printItem, setPrintItem] = useState<MonthlyPayrollItemRecord | null>(
    null,
  )
  const [printDialogOpen, setPrintDialogOpen] = useState(false)

  useEffect(() => {
    if (payroll?.items) {
      setItems(payroll.items)
    } else {
      setItems([])
    }
  }, [payroll])

  const handleItemChange = (
    index: number,
    field:
      'overtimeAmount' | 'bonusAmount' | 'commissionAmount' | 'deductionAmount',
    val: number,
  ) => {
    const updated = [...items]
    const item = { ...updated[index], [field]: val }
    const base = item.baseSalary || 0
    const ot = item.overtimeAmount || 0
    const bonus = item.bonusAmount || 0
    const comm = item.commissionAmount || 0
    const deduct = item.deductionAmount || 0
    item.netSalary = Math.max(0, base + ot + bonus + comm - deduct)
    updated[index] = item
    setItems(updated)
  }

  const handleSave = async () => {
    try {
      const result = await saveMutation.mutateAsync({
        storeId,
        period,
        items: items.map((it) => ({
          id: it.id,
          employeeConfigId: it.employeeConfigId,
          employeeName: it.employeeName,
          employeeCode: it.employeeCode,
          department: it.department,
          position: it.position,
          salaryType: it.salaryType,
          baseSalary: it.baseSalary,
          overtimeAmount: it.overtimeAmount,
          bonusAmount: it.bonusAmount,
          commissionAmount: it.commissionAmount,
          deductionAmount: it.deductionAmount,
          netSalary: it.netSalary,
          status: it.status,
          bankName: it.bankName,
          bankAccount: it.bankAccount,
          bankAccountName: it.bankAccountName,
          promptPay: it.promptPay,
          slipImage: it.slipImage,
          paymentNote: it.paymentNote,
        })),
      })

      if (result.success) {
        toast.success(t('settlement.saveSuccess'))
      } else {
        toast.error(result.message || t('settlement.saveFailed'))
      }
    } catch {
      toast.error(t('settlement.saveFailed'))
    }
  }

  const handleSyncToExpense = async () => {
    if (!payroll?.id || payroll.isDraft) {
      toast.error(t('settlement.saveChanges'))
      return
    }

    try {
      const result = await syncExpenseMutation.mutateAsync({
        payrollId: payroll.id,
        storeId,
        period,
      })

      if (result.success) {
        toast.success(t('settlement.syncSuccess'))
      } else {
        toast.error(result.message || t('settlement.saveFailed'))
      }
    } catch {
      toast.error(t('settlement.saveFailed'))
    }
  }

  const handleToggleClose = async () => {
    if (!payroll?.id || payroll.isDraft) {
      toast.error(t('settlement.saveChanges'))
      return
    }

    const willClose = !payroll.isClosed
    if (willClose && !confirm(t('settlement.closePayroll'))) {
      return
    }

    try {
      const result = await closeMutation.mutateAsync({
        payrollId: payroll.id,
        storeId,
        isClosed: willClose,
        autoRecordExpense: true,
        period,
      })

      if (result.success) {
        toast.success(
          willClose
            ? t('settlement.closeSuccess')
            : t('settlement.reopenSuccess'),
        )
      } else {
        toast.error(
          result.message ||
            (willClose
              ? t('settlement.closeFailed')
              : t('settlement.reopenFailed')),
        )
      }
    } catch {
      toast.error(
        willClose ? t('settlement.closeFailed') : t('settlement.reopenFailed'),
      )
    }
  }

  const openSlipModal = (item: MonthlyPayrollItemRecord) => {
    setSelectedSlipItem(item)
    setSlipDialogOpen(true)
  }

  const openPrintModal = (item: MonthlyPayrollItemRecord) => {
    setPrintItem(item)
    setPrintDialogOpen(true)
  }

  return {
    period,
    setPeriod,
    payroll,
    items,
    isLoading,
    isClosed: payroll?.isClosed ?? false,
    isSaving: saveMutation.isPending,
    isSyncing: syncExpenseMutation.isPending,
    isClosing: closeMutation.isPending,
    selectedSlipItem,
    slipDialogOpen,
    setSlipDialogOpen,
    printItem,
    printDialogOpen,
    setPrintDialogOpen,
    handleItemChange,
    handleSave,
    handleSyncToExpense,
    handleToggleClose,
    openSlipModal,
    openPrintModal,
    refetch,
  }
}
