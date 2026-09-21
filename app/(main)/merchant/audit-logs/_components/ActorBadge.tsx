'use client'

import { ACTOR_TYPE_TH } from '@/constants/translate'
import { ActorType } from '@/generated/prisma/enums'

import { Badge } from '@/components/ui/badge'

interface ActorBadgeProps {
  actorType: ActorType
}

export function ActorBadge({ actorType }: ActorBadgeProps) {
  const label = ACTOR_TYPE_TH[actorType] || actorType

  return (
    <Badge variant="outline" className="whitespace-nowrap">
      {label}
    </Badge>
  )
}
