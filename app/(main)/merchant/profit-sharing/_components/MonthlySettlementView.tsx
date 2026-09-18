'use client'

import React from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'
import { IconBuildingBank } from '@tabler/icons-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useCurrentStore } from '@/hooks/use-current-store'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'

import { SettlementDesktopPayouts } from './SettlementDesktopPayouts'
import { SettlementMobilePayouts } from './SettlementMobilePayouts'
import { SettlementPeriodControlBar } from './SettlementPeriodControlBar'
import { SettlementPrintStatement } from './SettlementPrintStatement'
import { SettlementSummaryCards } from './SettlementSummaryCards'
import { PayoutSlipDialog } from './PayoutSlipDialog'
import { useSettlementState } from '../_hooks/use-settlement-state'

interface MonthlySettlementViewProps {
  storeId: string
  storeName?: string
}

export function MonthlySettlementView({ storeId, storeName }: MonthlySettlementViewProps) {
  const { store } = useCurrentStore()
  const t = useTranslations('merchant.profitSharing')
  const { format } = useMerchantCurrency()
  const effectiveStoreName = storeName || store?.name

  const {
    periodOptions,
    selectedPeriod,
    setSelectedPeriod,
    currentSettlementRecord,
    existingRecord,
    isSettlementLoading,
    isPartnersLoading,
    isSaving,
    isClosing,
    isClosed,
    selectedPayout,
    slipDialogOpen,
    setSlipDialogOpen,
    printDialogOpen,
    setPrintDialogOpen,
    handleOpenSlip,
    handleCloseCycle,
    handleReopenCycle,
    refetchAnalytics,
  } = useSettlementState({ storeId })

  const isDataLoading = isSettlementLoading || isPartnersLoading

  return (
    <div className="space-y-6">
      {/* Period Selection & Cycle Action Bar */}
      <SettlementPeriodControlBar
        selectedPeriod={selectedPeriod}
        onSelectPeriod={setSelectedPeriod}
        periodOptions={periodOptions}
        isClosed={isClosed}
        hasExistingRecord={Boolean(existingRecord)}
        isSaving={isSaving}
        isClosing={isClosing}
        onRefresh={() => {
          refetchAnalytics()
          toast.success(t('settlement.toastRefreshSuccess'))
        }}
        onPrint={() => setPrintDialogOpen(true)}
        onCloseCycle={handleCloseCycle}
        onReopenCycle={handleReopenCycle}
      />

      {/* Financial Overview Cards */}
      <SettlementSummaryCards
        revenue={currentSettlementRecord.totalRevenue}
        cogs={currentSettlementRecord.totalCogs}
        expense={currentSettlementRecord.totalExpense}
        netProfit={currentSettlementRecord.netProfit}
        totalAllocated={currentSettlementRecord.totalAllocated}
        retainedEarnings={currentSettlementRecord.retainedEarnings}
      />

      {/* Payout Distribution Table / Mobile View */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <IconBuildingBank className="text-primary size-5" />
                {t('settlement.partnerPayoutsTitle')}
              </CardTitle>
              <CardDescription>
                {t('settlement.partnerPayoutsDesc')}
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <SettlementMobilePayouts
            payouts={currentSettlementRecord.payouts}
            isLoading={isDataLoading}
            formatCurrency={format}
            onOpenSlip={handleOpenSlip}
          />
          <SettlementDesktopPayouts
            payouts={currentSettlementRecord.payouts}
            isLoading={isDataLoading}
            formatCurrency={format}
            onOpenSlip={handleOpenSlip}
          />
        </CardContent>
      </Card>

      {/* Dialog for Transfer Slip & Status Update */}
      <PayoutSlipDialog
        open={slipDialogOpen}
        setOpen={setSlipDialogOpen}
        storeId={storeId}
        period={selectedPeriod}
        settlementId={existingRecord?.id}
        payout={selectedPayout}
      />

      {/* Print Statement Modal */}
      <SettlementPrintStatement
        open={printDialogOpen}
        setOpen={setPrintDialogOpen}
        settlement={existingRecord ?? null}
        storeName={effectiveStoreName}
      />
    </div>
  )
}
