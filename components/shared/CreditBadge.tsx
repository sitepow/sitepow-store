import { ComponentProps } from 'react'

import { BASE_CREDIT_VALUE_THB } from '@/constants/ai/config'
import { IconInfoCircle } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export interface CreditBadgeProps extends ComponentProps<typeof Badge> {
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
    <Badge
      variant="outline"
      className={cn(
        'border-primary/25 bg-primary/5 text-primary flex w-fit items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium',
        className,
      )}
      {...props}
    >
      <IconInfoCircle className="size-3.5 shrink-0" />
      <span>
        {baseAmount} {unitName} = {rate} {currencySymbol}
      </span>
    </Badge>
  )
}
