import { ComponentProps } from 'react'

import { IconBox } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

type EmptyImageProps = ComponentProps<'div'> & {
  hideIcon?: boolean
}

export function EmptyImage({ className, hideIcon, ...props }: EmptyImageProps) {
  return (
    <div
      className={cn(
        'bg-muted/30 text-muted-foreground/50 flex size-full items-center justify-center text-center',
        className,
      )}
      {...props}
    >
      {!hideIcon && <IconBox className="size-6" />}
    </div>
  )
}
