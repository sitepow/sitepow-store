import { ComponentProps, ComponentType, ReactNode } from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const pageTabHeaderVariants = cva(
  'flex flex-wrap items-center justify-between border-b pb-5',
  {
    variants: {
      variant: {
        default: '',
        secondary: 'pb-3',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface PageTabHeaderProps
  extends ComponentProps<'div'>, VariantProps<typeof pageTabHeaderVariants> {
  icon: ComponentType<{ className?: string; size?: number }>
  title: string
  description: string
  endContent?: ReactNode
}

export function PageTabHeader({
  icon,
  title,
  description,
  endContent,
  className,
  variant,
  ...props
}: PageTabHeaderProps) {
  const Icon = icon

  const isSecondary = variant === 'secondary'
  const iconSize = isSecondary ? 20 : 24

  return (
    <div
      className={cn(pageTabHeaderVariants({ variant, className }))}
      {...props}
    >
      <div>
        <div className="flex items-center gap-2">
          <Icon
            className={cn(
              isSecondary
                ? 'text-foreground'
                : 'fill-amber-500/20 text-amber-500',
            )}
            size={iconSize}
          />
          <h2
            className={cn(
              'text-foreground font-bold tracking-tight',
              isSecondary ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl',
            )}
          >
            {title}
          </h2>
        </div>
        <p className="text-muted-foreground mt-1 text-xs sm:text-sm">
          {description}
        </p>
      </div>

      {endContent}
    </div>
  )
}
