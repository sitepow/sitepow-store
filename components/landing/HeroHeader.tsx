import { ComponentProps, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface HeroHeaderProps extends Omit<ComponentProps<'header'>, 'title'> {
  title: ReactNode
  subtitle?: ReactNode
}

export function HeroHeader({
  title,
  subtitle,
  className,
  ...props
}: HeroHeaderProps) {
  return (
    <header
      className={cn(
        'text-foreground flex flex-col items-center gap-4',
        className,
      )}
      {...props}
    >
      <h1 className="max-w-2xl text-2xl leading-tight font-bold sm:text-4xl">
        {title}
      </h1>

      {subtitle && (
        <div className="-mt-4 flex flex-wrap items-center justify-center gap-2.5 text-xl font-medium opacity-60 sm:text-2xl">
          {subtitle}
        </div>
      )}
    </header>
  )
}
