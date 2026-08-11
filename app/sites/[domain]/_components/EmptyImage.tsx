import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export function EmptyImage({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'bg-foreground/10 text-muted-foreground mb-2.5 flex size-full items-center justify-center rounded-none text-center',
        className,
      )}
      {...props}
    >
      ไม่มีรูปภาพ
    </div>
  )
}
