'use client'

import { useMemo, useState } from 'react'
import toast from 'react-hot-toast'

import { useLocale, useTranslations } from 'next-intl'

import { useAnalyticsOverview } from '@/actions/hooks/analytics'
import {
  useCloseMonthlySettlement,
  useMonthlySettlement,
  useProfitPartners,
  useSaveMonthlySettlement,
} from '@/actions/hooks/profit-sharing'
import {
  MonthlySettlementRecord,
  PayoutStatus,
  ProfitPayoutItem,
  ShareType,
} from '@/types/profit-sharing'

interface UseSettlementStateParams {
  storeId: string
}

export function useSettlementState({ storeId }: UseSettlementStateParams) {
  const t = useTranslations('merchant.profitSharing')
  const locale = useLocale()
  const dateLocale = locale === 'th' ? 'th-TH' : 'en-US'

  const currentYear = new Date().getFullYear()
  const periodOptions = useMemo(() => {
    const list = []
    for (let y = currentYear; y >= currentYear - 1; y--) {
      for (let m = 12; m >= 1; m--) {
        const monthStr = m.toString().padStart(2, '0')
        const periodKey = `${y}-${monthStr}`
        const d = new Date(y, m - 1, 1)
        const label = d.toLocaleDateString(dateLocale, {
          month: 'long',
          year: 'numeric',
        })
        list.push({
          value: periodKey,
          label,
          year: y,
          month: m,
        })
      }
    }
    return list
  }, [currentYear, dateLocale])

  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })

  const { startDate, endDate, periodLabel } = useMemo(() => {
    const opt = periodOptions.find((p) => p.value === selectedPeriod)
    const [yStr, mStr] = selectedPeriod.split('-')
    const y = parseInt(yStr, 10)
    const m = parseInt(mStr, 10)
    const start = `${y}-${mStr}-01`
    const lastDay = new Date(y, m, 0).getDate()
    const end = `${y}-${mStr}-${lastDay.toString().padStart(2, '0')}`
    return {
      startDate: start,
      endDate: end,
      periodLabel: opt?.label || selectedPeriod,
    }
  }, [selectedPeriod, periodOptions])

  const { data: existingRecord, isLoading: isSettlementLoading } =
    useMonthlySettlement(storeId, selectedPeriod)
  const { data: partners = [], isLoading: isPartnersLoading } =
    useProfitPartners(storeId)

  const {
    data: analyticsData,
    isLoading: isAnalyticsLoading,
    refetch: refetchAnalytics,
  } = useAnalyticsOverview(storeId, undefined, startDate, endDate)

  const { mutate: saveSettlement, isPending: isSaving } =
    useSaveMonthlySettlement()
  const { mutate: closeSettlement, isPending: isClosing } =
    useCloseMonthlySettlement()

  const liveRevenue =
    analyticsData?.financialTrend.reduce(
      (acc, curr) => acc + curr.revenue,
      0,
    ) ?? 0
  const liveCogs =
    analyticsData?.financialTrend.reduce((acc, curr) => acc + curr.cogs, 0) ?? 0
  const liveExpense =
    analyticsData?.financialTrend.reduce(
      (acc, curr) => acc + curr.expense,
      0,
    ) ?? 0
  const liveNetProfit = liveRevenue - liveCogs - liveExpense

  const activePartners = partners.filter((p) => p.isActive)

  const currentSettlementRecord: MonthlySettlementRecord = useMemo(() => {
    if (existingRecord) {
      return existingRecord
    }

    const payouts: ProfitPayoutItem[] = activePartners.map((partner) => {
      let amount = 0
      const shareVal = Number(partner.shareValue)
      if (partner.shareType === ShareType.NET_PROFIT_PERCENT) {
        const base = Math.max(0, liveNetProfit)
        amount = Math.round((base * shareVal) / 100)
      } else if (partner.shareType === ShareType.REVENUE_PERCENT) {
        amount = Math.round((liveRevenue * shareVal) / 100)
      } else if (partner.shareType === ShareType.FIXED_MONTHLY) {
        amount = shareVal
      }

      return {
        id: `draft-${partner.id}`,
        settlementId: '',
        partnerId: partner.id,
        partnerName: partner.name,
        role: partner.role,
        shareType: partner.shareType,
        shareValue: shareVal,
        calculatedAmount: amount,
        status: PayoutStatus.PENDING,
        bankName: partner.bankName,
        bankAccount: partner.bankAccount,
        bankAccountName: partner.bankAccountName,
        promptPay: partner.promptPay,
        paidAt: null,
        slipImage: null,
        paymentNote: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    })

    const totalAllocated = payouts.reduce(
      (sum, p) => sum + Number(p.calculatedAmount),
      0,
    )
    const retainedEarnings = Math.max(0, liveNetProfit - totalAllocated)

    return {
      id: '',
      storeId,
      period: selectedPeriod,
      periodLabel,
      startDate,
      endDate,
      totalRevenue: liveRevenue,
      totalCogs: liveCogs,
      totalExpense: liveExpense,
      netProfit: liveNetProfit,
      totalAllocated,
      retainedEarnings,
      payouts,
      isClosed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }, [
    existingRecord,
    storeId,
    selectedPeriod,
    periodLabel,
    startDate,
    endDate,
    activePartners,
    liveRevenue,
    liveCogs,
    liveExpense,
    liveNetProfit,
  ])

  const [selectedPayout, setSelectedPayout] = useState<ProfitPayoutItem | null>(
    null,
  )
  const [slipDialogOpen, setSlipDialogOpen] = useState(false)
  const [printDialogOpen, setPrintDialogOpen] = useState(false)

  const handleSaveOrUpdateSettlement = (onDone?: () => void) => {
    saveSettlement(
      {
        storeId,
        period: selectedPeriod,
        periodLabel,
        startDate,
        endDate,
        totalRevenue: Number(currentSettlementRecord.totalRevenue),
        totalCogs: Number(currentSettlementRecord.totalCogs),
        totalExpense: Number(currentSettlementRecord.totalExpense),
        netProfit: Number(currentSettlementRecord.netProfit),
        totalAllocated: Number(currentSettlementRecord.totalAllocated),
        retainedEarnings: Number(currentSettlementRecord.retainedEarnings),
        isClosed: currentSettlementRecord.isClosed,
        payouts: currentSettlementRecord.payouts.map((p) => ({
          partnerId: p.partnerId,
          partnerName: p.partnerName,
          role: p.role,
          shareType: p.shareType,
          shareValue: Number(p.shareValue),
          calculatedAmount: Number(p.calculatedAmount),
          status: p.status,
          bankName: p.bankName,
          bankAccount: p.bankAccount,
          bankAccountName: p.bankAccountName,
          promptPay: p.promptPay,
          paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : null,
          slipImage: p.slipImage,
          paymentNote: p.paymentNote,
        })),
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(t('settlement.toastSaveSuccess'))
            onDone?.()
          } else {
            toast.error(res.message || t('settlement.toastSaveFailed'))
          }
        },
      },
    )
  }

  const handleOpenSlip = (payout: ProfitPayoutItem) => {
    if (!existingRecord) {
      handleSaveOrUpdateSettlement(() => {
        setSelectedPayout(payout)
        setSlipDialogOpen(true)
      })
    } else {
      setSelectedPayout(payout)
      setSlipDialogOpen(true)
    }
  }

  const handleCloseCycle = () => {
    if (
      window.confirm(t('settlement.closeCycleConfirm', { period: periodLabel }))
    ) {
      if (existingRecord?.id) {
        closeSettlement(
          {
            settlementId: existingRecord.id,
            storeId,
            isClosed: true,
          },
          {
            onSuccess: (res: { success?: boolean; message?: string }) => {
              if (res?.success) {
                toast.success(t('settlement.toastCloseSuccess'))
              } else {
                toast.error(res?.message || t('settlement.toastCloseFailed'))
              }
            },
          },
        )
      } else {
        saveSettlement(
          {
            storeId,
            period: selectedPeriod,
            periodLabel,
            startDate,
            endDate,
            totalRevenue: Number(currentSettlementRecord.totalRevenue),
            totalCogs: Number(currentSettlementRecord.totalCogs),
            totalExpense: Number(currentSettlementRecord.totalExpense),
            netProfit: Number(currentSettlementRecord.netProfit),
            totalAllocated: Number(currentSettlementRecord.totalAllocated),
            retainedEarnings: Number(currentSettlementRecord.retainedEarnings),
            isClosed: true,
            payouts: currentSettlementRecord.payouts.map((p) => ({
              partnerId: p.partnerId,
              partnerName: p.partnerName,
              role: p.role,
              shareType: p.shareType,
              shareValue: Number(p.shareValue),
              calculatedAmount: Number(p.calculatedAmount),
              status: p.status,
              bankName: p.bankName,
              bankAccount: p.bankAccount,
              bankAccountName: p.bankAccountName,
              promptPay: p.promptPay,
              paidAt: p.paidAt ? new Date(p.paidAt).toISOString() : null,
              slipImage: p.slipImage,
              paymentNote: p.paymentNote,
            })),
          },
          {
            onSuccess: (res: { success?: boolean; message?: string }) => {
              if (res?.success) {
                toast.success(t('settlement.toastCloseSuccess'))
              } else {
                toast.error(res?.message || t('settlement.toastCloseFailed'))
              }
            },
          },
        )
      }
    }
  }

  const handleReopenCycle = () => {
    if (existingRecord?.id) {
      closeSettlement(
        {
          settlementId: existingRecord.id,
          storeId,
          isClosed: false,
        },
        {
          onSuccess: (res: { success?: boolean; message?: string }) => {
            if (res?.success) {
              toast.success(t('settlement.toastReopenSuccess'))
            } else {
              toast.error(res?.message || t('settlement.toastReopenFailed'))
            }
          },
        },
      )
    }
  }

  return {
    periodOptions,
    selectedPeriod,
    setSelectedPeriod,
    periodLabel,
    existingRecord,
    currentSettlementRecord,
    isSettlementLoading,
    isPartnersLoading,
    isAnalyticsLoading,
    isSaving,
    isClosing,
    isClosed: currentSettlementRecord.isClosed,
    selectedPayout,
    slipDialogOpen,
    setSlipDialogOpen,
    printDialogOpen,
    setPrintDialogOpen,
    handleSaveOrUpdateSettlement,
    handleOpenSlip,
    handleCloseCycle,
    handleReopenCycle,
    refetchAnalytics,
  }
}

