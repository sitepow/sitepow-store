import { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SectionHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  title: ReactNode
  description?: ReactNode
}

export function SectionHeader({
  title,
  description,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        'text-foreground flex flex-col items-center gap-4',
        className,
      )}
      {...props}
    >
      <h2 className="max-w-2xl text-2xl leading-tight font-bold sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="max-w-4xl text-lg font-medium opacity-70 sm:text-2xl">
          {description}
        </p>
      )}
    </div>
  )
}
