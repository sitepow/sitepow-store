'use client'

import { useTranslations } from 'next-intl'

import { ACTOR_TYPE_TH } from '@/constants/translate'
import { ActorType } from '@/generated/prisma/enums'

import { useCurrentStore } from '@/hooks/use-current-store'
import { Badge } from '@/components/ui/badge'

interface ActorBadgeProps {
  actorType: ActorType
}

export function ActorBadge({ actorType }: ActorBadgeProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.auditLogs.actorTypes')
  const label = t.has(actorType)
    ? t(actorType)
    : ACTOR_TYPE_TH[actorType] || actorType

  return (
    <Badge
      variant="outline"
      className="whitespace-nowrap"
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
    >
      {label}
    </Badge>
  )
}
