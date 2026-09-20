import { ComponentProps, ElementType, ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface MainSectionHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  title: ReactNode
  as?: ElementType
}

export function MainSectionHeader({
  title,
  as: Heading = 'h2',
  className,
  ...props
}: MainSectionHeaderProps) {
  return (
    <div
      className={cn(
        'mx-auto flex flex-col items-center text-center',
        className,
      )}
      {...props}
    >
      <Heading className="text-xl font-bold tracking-tight text-neutral-800 sm:text-2xl md:text-3xl dark:text-neutral-100">
        {title}
      </Heading>
    </div>
  )
}
