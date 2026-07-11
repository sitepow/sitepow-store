import { ComponentProps } from 'react'

import { Label } from '@/components/ui/label'
import { RadioGroupItem } from '@/components/ui/radio-group'

import { cn } from '@/lib/utils'

interface RadioCardProps extends Omit<ComponentProps<'div'>, 'title'> {
  id: string
  value: string
  title: React.ReactNode
  description?: React.ReactNode
  trailing?: React.ReactNode
  children?: React.ReactNode
}

export function RadioCard({
  id,
  value,
  title,
  description,
  trailing,
  children,
  className,
  ...props
}: RadioCardProps) {
  return (
    <div className={cn('relative w-full', className)} {...props}>
      <Label
        htmlFor={id}
        className={cn(
          'dark:bg-foreground/5 border-border flex cursor-pointer justify-between gap-5 rounded-xl border p-4 text-start font-normal transition-all select-none',
          'has-data-[state=checked]:border-primary',
        )}
      >
        <RadioGroupItem value={value} id={id} />
        <div className="flex w-full flex-col">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="has-data-[state=checked]:text-primary [[data-state=checked]~&]:text-primary text-sm font-bold">
                {title}
              </div>
              {trailing && (
                <div className="flex shrink-0 items-center gap-4">
                  {trailing}
                </div>
              )}
              {description && (
                <div className="mt-0.5 text-xs opacity-60">{description}</div>
              )}
            </div>
          </div>
          {children && (
            <div className="mt-4 w-full border-t pt-4">{children}</div>
          )}
        </div>
      </Label>
    </div>
  )
}
