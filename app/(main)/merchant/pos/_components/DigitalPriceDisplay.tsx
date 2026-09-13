'use client'

import { useTranslations } from 'next-intl'

import { useCurrentStore } from '@/hooks/use-current-store'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'

import { cn } from '@/lib/utils'

interface DigitalPriceDisplayProps {
  value: number
  label?: string
  currency?: string
  digits?: number
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  skipConvert?: boolean
}

export function DigitalPriceDisplay({
  value,
  label,
  currency,
  digits,
  className,
  size = 'md',
  skipConvert = false,
}: DigitalPriceDisplayProps) {
  const { currentStore, store } = useCurrentStore()
  const { currencyInfo, convert } = useMerchantCurrency()
  const t = useTranslations('merchant.pos')
  const displayLabel = label ?? t('netPayable')
  const activeCurrency = currency ?? currencyInfo.symbol
  const activeDigits = digits ?? (currencyInfo.isZeroDecimal ? 0 : 2)
  const numericValue = skipConvert ? value : convert(value)
  const formattedValue = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: activeDigits,
    maximumFractionDigits: activeDigits,
  }).format(numericValue)

  const sizeStyles = {
    sm: {
      text: 'text-2xl',
      label: 'text-[10px]',
      padding: 'p-3',
      icon: 'text-lg',
    },
    md: {
      text: 'text-3xl md:text-4xl',
      label: 'text-xs',
      padding: 'p-4',
      icon: 'text-xl md:text-2xl',
    },
    lg: {
      text: 'text-4xl md:text-5xl',
      label: 'text-sm',
      padding: 'p-5',
      icon: 'text-2xl md:text-3xl',
    },
    xl: {
      text: 'text-5xl md:text-6xl',
      label: 'text-base',
      padding: 'p-6',
      icon: 'text-3xl md:text-4xl',
    },
  }[size]

  return (
    <div
      className={cn(
        'border-border bg-card text-card-foreground relative overflow-hidden rounded-xl border shadow-sm',
        sizeStyles.padding,
        className,
      )}
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-20 dark:opacity-40"
      />

      <div className="relative z-10 flex flex-col justify-between gap-1">
        {displayLabel && (
          <div className="text-muted-foreground flex items-center justify-between font-semibold tracking-wider uppercase">
            <span className={sizeStyles.label}>{displayLabel}</span>
          </div>
        )}

        <div className="flex items-baseline justify-end gap-2 overflow-x-auto whitespace-nowrap">
          <div
            className={cn(
              'relative inline-block tracking-widest tabular-nums',
              sizeStyles.text,
            )}
          >
            <span className="text-primary relative z-10 font-bold drop-shadow-xs">
              {formattedValue}
            </span>
          </div>
          <span
            className={cn(
              'text-primary/80 relative z-10 font-semibold',
              sizeStyles.icon,
            )}
          >
            {activeCurrency}
          </span>
        </div>
      </div>
    </div>
  )
}
