'use client'

import React from 'react'

import { useLocale, useTranslations } from 'next-intl'

import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { MonthlyPayrollItemRecord, MonthlyPayrollRecord } from '@/types/payroll'
import { IconPrinter, IconReceipt } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface PayrollPrintPayslipProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  payroll: MonthlyPayrollRecord
  item: MonthlyPayrollItemRecord | null
  storeName?: string
}

export function PayrollPrintPayslip({
  open,
  onOpenChange,
  payroll,
  item,
  storeName,
}: PayrollPrintPayslipProps) {
  const t = useTranslations('merchant.payroll.settlement.payslip')
  const locale = useLocale()
  const { formatCurrency } = useMerchantCurrency()

  if (!item) return null

  const displayStoreName = storeName || t('storeFallback')

  const handlePrint = () => {
    window.print()
  }

  const additions =
    item.overtimeAmount + item.bonusAmount + item.commissionAmount

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl print:m-0 print:max-w-none print:border-none print:p-0">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <IconReceipt className="text-primary size-5" />
              {t('title')}
            </DialogTitle>
            <Button size="sm" onClick={handlePrint}>
              <IconPrinter className="mr-1 size-4" />
              {t('print')}
            </Button>
          </div>
        </DialogHeader>

        {/* PRINTABLE SLIP CONTENT */}
        <div
          id="printable-payslip"
          className="bg-card text-foreground space-y-5 rounded-xl border p-6 print:border-none print:p-8"
        >
          {/* Header */}
          <div className="space-y-1 border-b pb-4 text-center">
            <h2 className="text-xl font-bold tracking-tight">
              {displayStoreName}
            </h2>
            <p className="text-muted-foreground text-sm font-medium">
              {t('subtitle')}
            </p>
            <p className="text-primary text-xs font-semibold">
              {t('period', { period: payroll.periodLabel })}
            </p>
          </div>

          {/* Employee Info Box */}
          <div className="bg-muted/30 border-border/50 grid grid-cols-2 gap-3 rounded-lg border p-3.5 text-xs">
            <div>
              <span className="text-muted-foreground">{t('empName')}: </span>
              <span className="text-foreground font-semibold">
                {item.employeeName}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{t('empCode')}: </span>
              <span className="text-foreground font-semibold">
                {item.employeeCode || '-'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{t('position')}: </span>
              <span className="text-foreground font-medium">
                {item.position || '-'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">{t('department')}: </span>
              <span className="text-foreground font-medium">
                {item.department || '-'}
              </span>
            </div>
          </div>

          {/* Breakdown Table */}
          <div className="space-y-3">
            <div className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              {t('breakdownTitle')}
            </div>

            <div className="divide-y rounded-lg border text-xs">
              <div className="bg-muted/10 flex justify-between px-3 py-2">
                <span className="text-foreground">{t('basePay')}</span>
                <span className="font-medium">
                  {formatCurrency(item.baseSalary)}
                </span>
              </div>
              {item.overtimeAmount > 0 && (
                <div className="flex justify-between px-3 py-2 text-emerald-600">
                  <span>{t('ot')}</span>
                  <span className="font-medium">
                    +{formatCurrency(item.overtimeAmount)}
                  </span>
                </div>
              )}
              {item.bonusAmount > 0 && (
                <div className="flex justify-between px-3 py-2 text-emerald-600">
                  <span>{t('bonus')}</span>
                  <span className="font-medium">
                    +{formatCurrency(item.bonusAmount)}
                  </span>
                </div>
              )}
              {item.commissionAmount > 0 && (
                <div className="flex justify-between px-3 py-2 text-emerald-600">
                  <span>{t('commission')}</span>
                  <span className="font-medium">
                    +{formatCurrency(item.commissionAmount)}
                  </span>
                </div>
              )}
              {item.deductionAmount > 0 && (
                <div className="flex justify-between px-3 py-2 text-rose-600">
                  <span>{t('deductions')}</span>
                  <span className="font-medium">
                    -{formatCurrency(item.deductionAmount)}
                  </span>
                </div>
              )}
            </div>

            {/* Total Net Box */}
            <div className="bg-primary/10 border-primary/20 flex items-center justify-between rounded-lg border p-3.5">
              <div>
                <div className="text-foreground text-sm font-bold">
                  {t('netTotal')}
                </div>
                <div className="text-muted-foreground text-[11px]">
                  {t('totalSummary', {
                    additions: formatCurrency(additions),
                    deductions: formatCurrency(item.deductionAmount),
                  })}
                </div>
              </div>
              <div className="text-primary text-xl font-bold">
                {formatCurrency(item.netSalary)}
              </div>
            </div>
          </div>

          {/* Payment & Bank Info */}
          <div className="bg-muted/20 text-muted-foreground space-y-1 rounded-lg border p-3 text-xs">
            <div className="text-foreground font-semibold">
              {t('paymentChannels')}
            </div>
            {item.bankName && (
              <div>
                {t('bankLabel')} {item.bankName}
              </div>
            )}
            {item.bankAccount && (
              <div>
                {t('accountLabel')} {item.bankAccount} (
                {item.bankAccountName || item.employeeName})
              </div>
            )}
            {item.promptPay && (
              <div>
                {t('promptPayLabel')} {item.promptPay}
              </div>
            )}
            <div className="pt-1 text-[11px]">
              {t('statusLabel')}{' '}
              {item.status === 'PAID'
                ? t('paidStatusSimple')
                : t('pendingStatusSimple')}
              {item.paidAt &&
                ` ${t('paidAtPrefix', { date: new Date(item.paidAt).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US') })}`}
            </div>
          </div>

          {/* Signatures */}
          <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
            <div className="space-y-8">
              <div className="border-muted-foreground/50 mx-auto w-3/4 border-b border-dashed" />
              <p className="text-muted-foreground">{t('payerSign')}</p>
            </div>
            <div className="space-y-8">
              <div className="border-muted-foreground/50 mx-auto w-3/4 border-b border-dashed" />
              <p className="text-muted-foreground">{t('receiverSign')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
