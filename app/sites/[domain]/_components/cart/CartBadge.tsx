import { ComponentProps } from 'react'

import { useStoreData } from '@/stores/storefront/use-store-data'

import { cn } from '@/lib/utils'

interface CartBadgeProps extends ComponentProps<'span'> {
  total: number
}

export function CartBadge({ total, className, ...props }: CartBadgeProps) {
  const { store } = useStoreData()

  return (
    <span
      style={{ '--primary': store?.primaryColor } as React.CSSProperties}
      className={cn(
        'text-primary-foreground bg-primary absolute -top-2 -right-2 flex size-6 items-center justify-center rounded-full text-[10px]',
        className,
      )}
      {...props}
    >
      {total > 99 ? '+99' : total}
    </span>
  )
}
