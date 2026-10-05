'use client'

import { ActorType } from '@/generated/prisma/enums'
import { ACTOR_TYPE_CONFIG } from '@/utils/activity/formatter'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface ActorBadgeProps {
  actorType: ActorType
  showIcon?: boolean
  className?: string
}

export function ActorBadge({
  actorType,
  className,
}: ActorBadgeProps) {
  const config = ACTOR_TYPE_CONFIG[actorType] || {
    label: actorType,
    desc: '',
  }

  return (
    <Badge
      variant="secondary"
      title={config.desc}
      className={cn('font-normal text-xs', className)}
    >
      {config.label}
    </Badge>
  )
}
