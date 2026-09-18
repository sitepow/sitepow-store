'use client'

import { useTranslations } from 'next-intl'

import { CircularProgress } from '../../_components/CircularProgress'

interface CartHeaderProgressProps {
  progressValue: number
  icon?: React.ElementType
  grandTotal: number
  currentCurrency?: string
  formatCurrency: (amount: number, currency?: string) => string
  convert: (amount: number) => number
  sectionDescription: string
}

export function CartHeaderProgress({
  progressValue,
  icon,
  grandTotal,
  currentCurrency,
  formatCurrency,
  convert,
  sectionDescription,
}: CartHeaderProgressProps) {
  const t = useTranslations('storefront.cart')

  return (
    <div className="border-border relative overflow-hidden rounded-xl border px-5 py-2.5 text-start shadow-sm">
      <div className="relative z-10 flex items-center gap-5">
        <CircularProgress size={60} value={progressValue} icon={icon} />
        <div className="space-y-0.5">
          <h3 className="font-bold" suppressHydrationWarning>
            {t('totalToPay')}{' '}
            <span className="font-extrabold">
              {formatCurrency(convert(grandTotal), currentCurrency)}
            </span>
          </h3>
          <p className="text-muted-foreground text-xs">{sectionDescription}</p>
        </div>
      </div>
    </div>
  )
}
