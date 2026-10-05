'use client'

import { LogAction } from '@/generated/prisma/enums'
import { LOG_ACTION_CONFIG } from '@/utils/activity/formatter'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ActionBadgeProps {
  action: LogAction
  className?: string
}

export function ActionBadge({ action, className }: ActionBadgeProps) {
  const meta = LOG_ACTION_CONFIG[action] || {
    label: action,
    color: { badge: '' },
  }

  return (
    <Badge
      variant="outline"
      className={cn('font-normal', meta.color?.badge, className)}
    >
      {meta.label}
    </Badge>
  )
}
