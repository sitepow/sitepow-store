import { ComponentProps, ComponentType, ReactNode } from 'react'

import { type VariantProps, cva } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const pageTabHeaderVariants = cva(
  'flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border/60 pb-6 mb-6',
  {
    variants: {
      variant: {
        default: 'pb-6 mb-6',
        secondary: 'pb-4 mb-4 border-b border-border/40',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

interface PageTabHeaderProps
  extends ComponentProps<'div'>, VariantProps<typeof pageTabHeaderVariants> {
  icon?: ComponentType<{ className?: string; size?: number }>
  title: string
  description?: string
  endContent?: ReactNode
}

export function PageTabHeader({
  icon: Icon,
  title,
  description,
  endContent,
  className,
  variant,
  ...props
}: PageTabHeaderProps) {
  const isSecondary = variant === 'secondary'
  const iconSize = isSecondary ? 18 : 22

  return (
    <div
      className={cn(pageTabHeaderVariants({ variant, className }))}
      {...props}
    >
      <div className="flex items-start gap-3">
        {Icon && (
          <div
            className={cn(
              'border-border/50 bg-muted/30 flex items-center justify-center rounded-lg border',
              isSecondary ? 'p-1.5' : 'mt-0.5 p-2',
            )}
          >
            <Icon
              className={cn(
                isSecondary ? 'text-muted-foreground' : 'text-foreground/80',
              )}
              size={iconSize}
            />
          </div>
        )}

        <div className="space-y-1">
          <h2
            className={cn(
              'text-foreground font-semibold tracking-tight',
              isSecondary ? 'text-lg' : 'text-xl md:text-2xl',
            )}
          >
            {title}
          </h2>
          {description && (
            <p className="text-muted-foreground/90 max-w-2xl text-sm leading-relaxed font-normal">
              {description}
            </p>
          )}
        </div>
      </div>

      {endContent && (
        <div className="flex shrink-0 items-center gap-2 self-start sm:self-center">
          {endContent}
        </div>
      )}
    </div>
  )
}
