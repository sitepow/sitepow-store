'use client'

import { ComponentProps } from 'react'

import { useTranslations } from 'next-intl'

import { useStoreData } from '@/stores/sites/use-store-data'
import { formatCurrency, formatNumber } from '@/utils/pricing'

import { HighlightText } from '@/components/HighlightText'
import { Separator } from '@/components/ui/separator'

import { cn } from '@/lib/utils'

import { useCartStore } from '../../../cart/store'
import { SummaryRow } from './SummaryRow'

interface CartSummaryCustomData {
  subtotal: number
  totalDiscount: number
  totalPoints: number
  finalPrice: number
}

interface CartSummaryProps extends ComponentProps<'div'> {
  summary?: CartSummaryCustomData
}

export function CartSummary({
  className,
  summary: customSummary,
  ...props
}: CartSummaryProps) {
  const t = useTranslations('storefront')
  const { store } = useStoreData()
  const { getCartSummary } = useCartStore()
  const summary = customSummary ?? getCartSummary()

  return (
    <div
      className={cn('space-y-1.5 py-2', className)}
      {...props}
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
    >
      <SummaryRow
        label={t('products.price')}
        value={formatCurrency(summary.subtotal)}
      />
      {summary.totalDiscount > 0 && (
        <SummaryRow
          label={t('cart.discount')}
          value={
            <HighlightText>
              - {formatCurrency(Math.abs(summary.totalDiscount))}
            </HighlightText>
          }
        />
      )}
      <Separator className="my-2" />
      {summary.totalPoints > 0 && (
        <p className="text-primary text-right text-xs font-medium">
          {t('cart.earnPoints', { points: formatNumber(summary.totalPoints) })}
        </p>
      )}
      <SummaryRow
        label={t('cart.actualTotal')}
        value={formatCurrency(summary.finalPrice)}
      />
    </div>
  )
}
