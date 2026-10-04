import { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface SectionHeaderProps extends Omit<ComponentProps<'header'>, 'title'> {
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
    <header
      className={cn(
        'text-foreground flex flex-col items-center gap-4 text-center',
        className,
      )}
      {...props}
    >
      <h2 className="max-w-2xl text-2xl leading-tight font-bold sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="max-w-4xl text-lg font-medium opacity-60 sm:text-2xl">
          {description}
        </p>
      )}
    </header>
  )
}
