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
    <Badge
      variant="outline"
      className="bg-muted/40 text-muted-foreground border-muted-foreground/20 px-2 py-0.5 text-[11px] font-medium whitespace-nowrap shadow-none select-none"
    >
      {label}
    </Badge>
  )
}
