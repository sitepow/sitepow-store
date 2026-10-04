'use client'

import { LOG_ACTION_TH } from '@/constants/i18n/translate'
import { LogAction } from '@/generated/prisma/enums'

import { Badge } from '@/components/ui/badge'

interface ActionBadgeProps {
  action: LogAction
}

export function ActionBadge({ action }: ActionBadgeProps) {
  const label = LOG_ACTION_TH[action] || action

  return (
    <Badge variant={'outline'} className="whitespace-nowrap">
      {label}
    </Badge>
  )
}
