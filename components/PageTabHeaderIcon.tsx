import { ComponentProps, ComponentType } from 'react'

import { cn } from '@/lib/utils'

interface PageTabHeaderIconProps extends ComponentProps<'div'> {
  icon: ComponentType<{ className?: string; size?: number }>
}

export function PageTabHeaderIcon({
  icon: Icon,
  className,
  ...props
}: PageTabHeaderIconProps) {
  return (
    <div
      className={cn(
        'border-border/50 bg-muted/30 mt-0.5 flex items-center justify-center rounded-lg border p-2',
        className,
      )}
      {...props}
    >
      <Icon size={22} />
    </div>
  )
}
