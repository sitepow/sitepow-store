import { ComponentProps } from 'react'

import { BASE_CREDIT_VALUE_THB } from '@/constants/ai'
import { IconInfoCircle } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

export interface CreditBadgeProps extends ComponentProps<'div'> {
  rate?: number
  unitName?: string
  currencySymbol?: string
  baseAmount?: number
}

export function CreditBadge({
  rate = BASE_CREDIT_VALUE_THB,
  unitName = 'เครดิต',
  currencySymbol = 'บาท',
  baseAmount = 1,
  className,
  ...props
}: CreditBadgeProps) {
  return (
    <div
      className={cn(
        'border-primary/20 bg-primary/5 text-primary flex w-fit items-center gap-2 rounded-full border p-3 text-xs font-medium',
        className,
      )}
      {...props}
    >
      <IconInfoCircle className="size-3.5 shrink-0" />
      <span>
        {baseAmount} {unitName} = {rate} {currencySymbol}
      </span>
    </div>
  )
}
