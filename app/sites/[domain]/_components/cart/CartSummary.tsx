'use client'

import { formatCurrency, formatNumber } from '@/utils/pricing'

import { Separator } from '@/components/ui/separator'

import { cn } from '@/lib/utils'

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

function SummaryRow({
  label,
  value,
  isDiscount = false,
}: {
  label: string
  value: string | number
  isDiscount?: boolean
}) {
  return (
    <div
      className={cn(
        'flex justify-between text-sm',
        isDiscount && 'text-primary',
      )}
    >
      <span className={'text-muted-foreground'}>{label}</span>
      <span>{isDiscount ? `- ${value}` : value}</span>
    </div>
  )
}

function SummaryTotal({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-lg font-bold">
      <span>{label}</span>
      <span className="text-primary">{value}</span>
    </div>
  )
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
        <p className="text-primary text-right text-xs font-medium">
          คุณจะได้รับ {formatNumber(summary.totalPoints)} แต้ม
        </p>
      )}
    </div>
  )
}
