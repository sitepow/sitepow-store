import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

interface SummaryRowProps extends ComponentProps<'div'> {
  label: string
  value: React.ReactNode
  isDiscount?: boolean
}

export function SummaryRow({
  label,
  value,
  isDiscount = false,
  className,
  ...props
}: SummaryRowProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between text-sm',
        isDiscount && 'text-primary',
        className,
      )}
      {...props}
    >
      <span className="text-muted-foreground">{label}</span>
      <span>
        {isDiscount && (typeof value === 'string' || typeof value === 'number')
          ? `- ${value}`
          : value}
      </span>
    </div>
  )
}
