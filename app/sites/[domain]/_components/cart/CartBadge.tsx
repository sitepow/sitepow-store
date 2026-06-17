import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

interface CartBadgeProps extends ComponentProps<'span'> {
  total: number
}

export function CartBadge({ total, className, ...props }: CartBadgeProps) {
  return (
    <span
      className={cn(
        'bg-primary text-primary-foreground absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full text-[10px]',
        className,
      )}
      {...props}
    >
      {total > 99 ? '+99' : total}
    </span>
  )
}
