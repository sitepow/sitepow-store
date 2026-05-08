import { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

interface DashboardHeaderProps extends ComponentProps<'div'> {
  title: string
  description?: string
}

export function DashboardHeader({
  title,
  description,
  className,
  ...props
}: DashboardHeaderProps) {
  return (
    <div className={cn('space-y-1', className)} {...props}>
      <h1 className="text-foreground text-3xl font-bold tracking-tight">
        {title}
      </h1>
      {description && (
        <p className="text-muted-foreground text-lg">{description}</p>
      )}
    </div>
  )
}
