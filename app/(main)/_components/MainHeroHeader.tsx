import { ComponentProps, ReactNode } from 'react'

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
        'mx-auto w-full max-w-5xl space-y-6 px-4 pt-8 pb-4 text-center sm:px-6 lg:px-8',
        className,
      )}
      {...props}
    >
      {badgeText && (
        <div className="border-primary/30 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-semibold shadow-2xs">
          {badgeIcon}
          <span>{badgeText}</span>
        </div>
      )}
      <div className="space-y-4">
        <h1 className="text-foreground text-3xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground mx-auto max-w-3xl text-base leading-relaxed text-balance sm:text-lg">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  )
}
