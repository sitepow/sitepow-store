import { ComponentProps, ElementType, ReactNode } from 'react'

import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'

import { cn } from '@/lib/utils'

interface MainSectionHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  badge?: ReactNode
  title: ReactNode
  description?: ReactNode
  as?: ElementType
}

export function MainSectionHeader({
  badge,
  title,
  description,
  as: Heading = 'h2',
  className,
  ...props
}: MainSectionHeaderProps) {
  return (
    <div
      className={cn(
        'mx-auto flex flex-col items-center text-center',
        'max-w-3xl space-y-2 px-3 sm:space-y-4 sm:px-4',
        className,
      )}
      {...props}
    >
      {badge && (
        <span className="text-primary text-[11px] font-semibold sm:text-xs">
          <AnimatedShinyText className="text-primary dark:text-primary">
            {badge}
          </AnimatedShinyText>
        </span>
      )}
      <Heading className="text-foreground font-landing max-w-2xl text-xl font-bold tracking-tight text-balance sm:text-3xl md:text-4xl md:leading-tight">
        {title}
      </Heading>
      {description && (
        <p className="text-muted-foreground max-w-xl text-xs leading-relaxed sm:text-base">
          {description}
        </p>
      )}
    </div>
  )
}
