import {
  type ComponentProps,
  type ReactElement,
  type ReactNode,
  cloneElement,
  isValidElement,
} from 'react'

import { IconUser } from '@tabler/icons-react'

import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface CustomerCardProps extends Omit<
  ComponentProps<typeof Card>,
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
    <Card
      className={cn(
        'border-border bg-card text-card-foreground flex flex-row items-center justify-between gap-3 rounded-xl border p-3.5 shadow-xs',
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 text-primary ring-primary/20 flex size-9 shrink-0 items-center justify-center rounded-xl ring-1">
          {renderedIcon}
        </div>
        <div className="space-y-1">
          <p className="text-foreground text-sm font-semibold leading-tight">
            {title}
          </p>
          {content && (
            <div className="text-muted-foreground text-xs leading-normal">{content}</div>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </Card>
  )
}
