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
          'flex cursor-pointer justify-between gap-5 rounded-xl border border-gray-200 bg-white p-4 text-start font-normal transition-all select-none hover:border-gray-300',
          'has-data-[state=checked]:border-primary has-data-[state=checked]:bg-primary/5 has-data-[state=checked]:ring-primary has-data-[state=checked]:ring-1',
        )}
      >
        <RadioGroupItem value={value} id={id} className="size-5 shrink-0" />

        <div className="flex w-full flex-col">
          <div className="flex w-full items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="[[data-state=checked]~&]:text-primary has-data-[state=checked]:text-primary text-sm font-bold text-gray-700">
                {title}
              </div>
              {trailing && (
                <div className="flex shrink-0 items-center gap-4">
                  {trailing}
                </div>
              )}
              {description && (
                <div className="text-muted-foreground mt-0.5 text-xs">
                  {description}
                </div>
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
