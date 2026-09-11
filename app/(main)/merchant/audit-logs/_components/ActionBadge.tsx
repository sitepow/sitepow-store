'use client'

import { useTranslations } from 'next-intl'

import { LOG_ACTION_TH } from '@/constants/translate'
import { LogAction } from '@/generated/prisma/enums'

import { useCurrentStore } from '@/hooks/use-current-store'
import { Badge } from '@/components/ui/badge'

interface ActionBadgeProps {
  action: LogAction
}

export function ActionBadge({ action }: ActionBadgeProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.auditLogs.actions')
  const label = t.has(action) ? t(action) : LOG_ACTION_TH[action] || action

  return (
    <Badge
      variant={'outline'}
      className="whitespace-nowrap"
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      {label}
    </Badge>
  )
}
