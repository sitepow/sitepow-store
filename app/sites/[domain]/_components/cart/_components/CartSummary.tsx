'use client'

import { ComponentProps } from 'react'

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
  const { getCartSummary } = useCartStore()

  const summary = customSummary ?? getCartSummary()

  return (
    <div className={cn('space-y-1.5 py-2', className)} {...props}>
      <SummaryRow label="ราคาสินค้า" value={formatCurrency(summary.subtotal)} />
      {summary.totalDiscount > 0 && (
        <SummaryRow
          label="ส่วนลด"
          value={formatCurrency(Math.abs(summary.totalDiscount))}
          isDiscount
        />
      )}
      <Separator className="my-2" />
      {summary.totalPoints > 0 && (
        <p className="text-primary text-right text-xs font-medium">
          คุณจะได้รับ {formatNumber(summary.totalPoints)} แต้ม
        </p>
      )}
      <SummaryRow
        label="ยอดที่ต้องจ่ายจริง"
        value={
          <HighlightText>{formatCurrency(summary.finalPrice)}</HighlightText>
        }
      />
    </div>
  )
}
