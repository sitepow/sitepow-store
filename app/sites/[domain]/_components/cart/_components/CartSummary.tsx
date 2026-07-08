'use client'

import { formatCurrency, formatNumber } from '@/utils/pricing'

import { Separator } from '@/components/ui/separator'

import { cn } from '@/lib/utils'

import { SummaryRow } from './SummaryRow'
import { SummaryTotal } from './SummaryTotal'

interface CartSummaryData {
  subtotal: number
  totalDiscount: number
  finalPrice: number
  totalPoints: number
}

interface CartSummaryProps {
  summary: CartSummaryData
  className?: string
}

export function CartSummary({ summary, className }: CartSummaryProps) {
  return (
    <div className={cn('space-y-1.5 py-2', className)}>
      <SummaryRow
        label="รวมราคาสินค้า"
        value={formatCurrency(summary.subtotal)}
      />
      <SummaryRow
        label="ส่วนลด"
        value={formatCurrency(Math.abs(summary.totalDiscount))}
        isDiscount
      />
      <Separator className="my-2" />
      <SummaryTotal
        label="ราคาสุทธิ"
        value={formatCurrency(summary.finalPrice)}
      />
      {summary.totalPoints > 0 && (
        <p className="text-right text-xs font-medium text-(--brand-color)">
          คุณจะได้รับ {formatNumber(summary.totalPoints)} แต้ม
        </p>
      )}
    </div>
  )
}
