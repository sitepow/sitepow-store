import { CSSProperties, ComponentPropsWithoutRef, FC } from 'react'

import { cn } from '@/lib/utils'

export interface AnimatedShinyTextProps extends ComponentPropsWithoutRef<'p'> {
  shimmerWidth?: number
}

export const AnimatedShinyText: FC<AnimatedShinyTextProps> = ({
  children,
  className,
  shimmerWidth = 100,
  ...props
}) => {
  return (
    <p
      style={
        {
          '--shiny-width': `${shimmerWidth}px`,
        } as CSSProperties
      }
      className={cn(
        'mx-auto max-w-md text-neutral-400/80 dark:text-neutral-400/80',
        // Shimmer effect
        'animate-shiny-text [background-size:var(--shiny-width)_100%] bg-clip-text [background-position:0_0] bg-no-repeat [transition:background-position_1s_cubic-bezier(.6,.6,0,1)_infinite]',
        // Shimmer gradient
        'bg-gradient-to-r from-transparent via-white/80 via-50% to-transparent',
        className,
      )}
      {...props}
    >
      {children}
    </p>
  )
}
