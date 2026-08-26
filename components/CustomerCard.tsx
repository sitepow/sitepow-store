import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
} from 'react'

import { IconUser } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

export interface CustomerCardProps extends Omit<
  ComponentProps<'div'>,
  'title' | 'content'
> {
  icon?: ReactNode
  title: ReactNode
  content?: ReactNode
  action?: ReactNode
}

export function CustomerCard({
  icon = <IconUser />,
  title,
  content,
  action,
  className,
  ...props
}: CustomerCardProps) {
  const renderedIcon = isValidElement(icon)
    ? cloneElement(icon as ReactElement<{ className?: string }>, {
        className: cn(
          'size-4',
          (icon.props as { className?: string }).className,
        ),
      })
    : icon

  return (
    <div
      className={cn(
        'border-border flex items-center justify-between gap-3 rounded-xl border p-3.5',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div className="border-border text-primary flex size-9 shrink-0 items-center justify-center rounded-full border">
          {renderedIcon}
        </div>
        <div className="space-y-2.5">
          <p className="text-foreground text-sm leading-none font-bold">
            {title}
          </p>
          {content && (
            <div className="text-muted-foreground text-xs">{content}</div>
          )}
        </div>
      </div>
      {action}
    </div>
  )
}
