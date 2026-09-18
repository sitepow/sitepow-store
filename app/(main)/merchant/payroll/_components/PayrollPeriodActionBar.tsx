'use client'

import { useLocale, useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconDeviceFloppy,
  IconLock,
  IconLockOpen,
  IconReceipt,
  IconReceiptTax,
} from '@tabler/icons-react'

interface PayrollPeriodActionBarProps {
  period: string
  onPeriodChange: (period: string) => void
  isClosed: boolean
  hasExpenseLinked: boolean
  hasPayrollId: boolean
  isSaving: boolean
  isSyncing: boolean
  isClosing: boolean
  onSave: () => void
  onSyncExpense: () => void
  onToggleClose: () => void
}

export function PayrollPeriodActionBar({
  period,
  onPeriodChange,
  isClosed,
  hasExpenseLinked,
  hasPayrollId,
  isSaving,
  isSyncing,
  isClosing,
  onSave,
  onSyncExpense,
  onToggleClose,
}: PayrollPeriodActionBarProps) {
  const t = useTranslations('merchant.payroll')
  const locale = useLocale()

  return (
    <div className="border-border/70 bg-card flex flex-col gap-4 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-3">
        <div className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
          <IconReceiptTax className="text-primary size-5" />
          {t('settlement.selectPeriod')}:
        </div>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={t('settlement.selectPeriod')} />
          </SelectTrigger>
          <SelectContent>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((offset) => {
              const d = new Date()
              d.setMonth(d.getMonth() - offset)
              const y = d.getFullYear()
              const m = String(d.getMonth() + 1).padStart(2, '0')
              const val = `${y}-${m}`
              const label = d.toLocaleDateString(
                locale === 'th' ? 'th-TH' : 'en-US',
                {
                  month: 'long',
                  year: 'numeric',
                },
              )
              return (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {isClosed ? (
          <Badge className="border-emerald-200 bg-emerald-500/10 text-emerald-600">
            <IconLock className="mr-1 size-3" />
            {t('settlement.closed')}
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="inline-flex items-center gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600"
          >
            <IconLockOpen className="mr-1 size-3" />
            {t('settlement.open')}
          </Badge>
        )}

        {hasExpenseLinked && (
          <Badge className="border-blue-200 bg-blue-500/10 text-blue-600">
            <IconReceipt className="mr-1 size-3" />
            {t('settlement.expenseLinked')}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {!isClosed && (
          <Button
            variant="outline"
            size="sm"
            disabled={isSaving}
            onClick={onSave}
          >
            <IconDeviceFloppy className="mr-1 size-4" />
            {isSaving
              ? t('settlement.saving')
              : t('settlement.saveChanges')}
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          disabled={isSyncing || !hasPayrollId}
          onClick={onSyncExpense}
          className="text-primary hover:text-primary"
        >
          <IconReceipt className="mr-1 size-4" />
          {isSyncing
            ? t('settlement.saving')
            : t('settlement.syncExpense')}
        </Button>

        <Button
          size="sm"
          variant={isClosed ? 'outline' : 'default'}
          disabled={isClosing || !hasPayrollId}
          onClick={onToggleClose}
        >
          {isClosed ? (
            <>
              <IconLockOpen className="mr-1 size-4" />
              {t('settlement.reopenPayroll')}
            </>
          ) : (
            <>
              <IconLock className="mr-1 size-4" />
              {t('settlement.closePayroll')}
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

