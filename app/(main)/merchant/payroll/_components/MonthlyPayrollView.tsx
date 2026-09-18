'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { useCurrentStore } from '@/hooks/use-current-store'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { IconReceipt2 } from '@tabler/icons-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { useMonthlyPayrollState } from '../_hooks/use-monthly-payroll-state'
import { PayrollDesktopTable } from './PayrollDesktopTable'
import { PayrollMobileCards } from './PayrollMobileCards'
import { PayrollPeriodActionBar } from './PayrollPeriodActionBar'
import { PayrollPrintPayslip } from './PayrollPrintPayslip'
import { PayrollSlipDialog } from './PayrollSlipDialog'
import { PayrollSummaryCards } from './PayrollSummaryCards'

interface MonthlyPayrollViewProps {
  storeId: string
  storeName?: string
}

export function MonthlyPayrollView({
  storeId,
  storeName,
}: MonthlyPayrollViewProps) {
  const t = useTranslations('merchant.payroll')
  const { store } = useCurrentStore()
  const { formatCurrency } = useMerchantCurrency()
  const effectiveStoreName = storeName || store?.name

  const {
    period,
    setPeriod,
    payroll,
    isLoading,
    items,
    isSaving,
    isSyncing,
    isClosing,
    isClosed,
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
  } = useMonthlyPayrollState({ storeId })

  return (
    <div className="space-y-6">
      {/* Action Header with Period Picker & Cycle Status */}
      <PayrollPeriodActionBar
        period={period}
        onPeriodChange={setPeriod}
        isClosed={isClosed}
        hasExpenseLinked={Boolean(payroll?.expenseId)}
        hasPayrollId={Boolean(payroll?.id)}
        isSaving={isSaving}
        isSyncing={isSyncing}
        isClosing={isClosing}
        onSave={handleSave}
        onSyncExpense={handleSyncToExpense}
        onToggleClose={handleToggleClose}
      />

      {/* Summary KPI Cards */}
      <PayrollSummaryCards payroll={payroll} isLoading={isLoading} />

      {/* Staff Payroll List / Table */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <IconReceipt2 className="text-primary size-5" />
                {t('settlement.itemsTitle')}
              </CardTitle>
              <CardDescription>{t('settlement.itemsDesc')}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <PayrollMobileCards
            items={items}
            isClosed={isClosed}
            formatCurrency={formatCurrency}
            onItemChange={handleItemChange}
            onOpenSlip={openSlipModal}
            onOpenPrint={openPrintModal}
          />
          <PayrollDesktopTable
            items={items}
            isClosed={isClosed}
            formatCurrency={formatCurrency}
            onItemChange={handleItemChange}
            onOpenSlip={openSlipModal}
            onOpenPrint={openPrintModal}
          />
        </CardContent>
      </Card>

      {/* Payslip & Transfer Slip Dialog */}
      <PayrollSlipDialog
        open={slipDialogOpen}
        onOpenChange={setSlipDialogOpen}
        storeId={storeId}
        period={period}
        item={selectedSlipItem}
      />

      {/* Printable Payslip Statement Dialog */}
      {payroll && (
        <PayrollPrintPayslip
          open={printDialogOpen}
          onOpenChange={setPrintDialogOpen}
          payroll={payroll}
          item={printItem}
          storeName={effectiveStoreName}
        />
      )}
    </div>
  )
}
