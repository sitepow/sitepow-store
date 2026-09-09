import { ComponentProps, ReactNode } from 'react'

import { AnimatedShinyText } from '@/components/magicui/animated-shiny-text'

import { cn } from '@/lib/utils'

interface MainHeroHeaderProps extends Omit<ComponentProps<'div'>, 'title'> {
  badgeIcon?: ReactNode
  badgeText?: string
  title: ReactNode
  description?: ReactNode
  children?: ReactNode
}

export function MainHeroHeader({
  badgeIcon,
  badgeText,
  title,
  description,
  children,
  className,
  ...props
}: MainHeroHeaderProps) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-5xl space-y-4 px-3.5 pt-4 pb-2 text-center sm:space-y-6 sm:px-6 sm:pt-8 sm:pb-4 lg:px-8',
        className,
      )}
      {...props}
    >
      {badgeText && (
        <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full border px-3 py-0.5 text-xs font-semibold shadow-2xs sm:px-3.5 sm:py-1">
          {badgeIcon}
          <AnimatedShinyText className="text-primary dark:text-primary">
            {badgeText}
          </AnimatedShinyText>
        </div>
      )}
      <div className="space-y-2.5 sm:space-y-4">
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mx-auto max-w-3xl text-xs leading-relaxed text-balance sm:text-base md:text-lg">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
