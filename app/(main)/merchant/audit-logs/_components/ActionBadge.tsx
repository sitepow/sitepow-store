'use client'

import { useTranslations } from 'next-intl'

import { LOG_ACTION_TH } from '@/constants/translate'
import { LogAction } from '@/generated/prisma/enums'

import { Badge } from '@/components/ui/badge'

interface ActionBadgeProps {
  action: LogAction
}

export function ActionBadge({ action }: ActionBadgeProps) {
  const t = useTranslations('merchant.auditLogs.actions')
  const label = t.has(action) ? t(action) : LOG_ACTION_TH[action] || action

  return (
    <Badge variant={'outline'} className="whitespace-nowrap">
      {label}
    </Badge>
  )
}
