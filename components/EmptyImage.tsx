import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export type EmptyImageProps = ComponentProps<'div'> & {
  text?: string
}

export function EmptyImage({ className, text, ...props }: EmptyImageProps) {
  return (
    <div
      className={cn(
        'bg-primary text-primary-foreground flex size-full items-center justify-center p-2 text-center',
        className,
      )}
      {...props}
    >
      {text && <span className="line-clamp-3 select-none">{text}</span>}
    </div>
  )
}
