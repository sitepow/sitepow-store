'use client'

import { useTranslations } from 'next-intl'

import { formatNumber } from '@/utils/pricing'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { cn } from '@/lib/utils'

interface PosCashPaymentSectionProps {
  payableAmount: number
  receivedAmount: number
  quickAmounts: number[]
  currencySymbol: string
  formatRawCurrency: (val: number) => string
  onAmountChange: (amount: number) => void
  onClear: () => void
}

export function PosCashPaymentSection({
  payableAmount,
  receivedAmount,
  quickAmounts,
  currencySymbol,
  formatRawCurrency,
  onAmountChange,
  onClear,
}: PosCashPaymentSectionProps) {
  const t = useTranslations('merchant.pos.checkoutModal')
  const isValidCash = receivedAmount >= payableAmount
  const changeAmount = receivedAmount - payableAmount

  return (
    <div className="bg-muted/30 border-border/80 space-y-4 rounded-xl border p-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold">{t('receivedAmount')}</Label>
          {receivedAmount > 0 && (
            <button
              type="button"
              onClick={onClear}
              className="text-muted-foreground hover:text-foreground text-xs underline"
            >
              {t('clearAmount')}
            </button>
          )}
        </div>
        <div className="relative">
          <Input
            type="number"
            min={payableAmount}
            value={receivedAmount || ''}
            onChange={(e) => onAmountChange(Number(e.target.value))}
            autoFocus
            placeholder="0.00"
            className="h-12 pr-12 text-right text-xl font-bold tracking-wide"
          />
          <span className="text-muted-foreground absolute top-3 right-3 text-sm font-semibold">
            {currencySymbol}
          </span>
        </div>
      </div>
      <div className="grid grid-cols-4 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 font-medium"
          onClick={() => onAmountChange(payableAmount)}
        >
          {t('exactAmount')}
        </Button>
        {quickAmounts.map((amt) => (
          <Button
            key={amt}
            type="button"
            variant="outline"
            size="sm"
            className="h-9 font-medium"
            onClick={() => onAmountChange(amt)}
          >
            {formatNumber(amt)}
          </Button>
        ))}
      </div>
      <div
        className={cn(
          'flex items-center justify-between rounded-lg p-3.5 transition-all',
          receivedAmount > 0 && !isValidCash
            ? 'bg-destructive/10 text-destructive'
            : 'bg-background border',
        )}
      >
        <span className="text-sm font-medium">
          {receivedAmount > 0 && !isValidCash
            ? t('insufficientAmount')
            : t('change')}
        </span>
        <span
          className={cn(
            'text-xl font-extrabold',
            receivedAmount > 0 && !isValidCash
              ? 'text-destructive'
              : 'text-primary',
          )}
        >
          {receivedAmount > 0 ? formatRawCurrency(Math.abs(changeAmount)) : '-'}
        </span>
      </div>
    </div>
  )
}
