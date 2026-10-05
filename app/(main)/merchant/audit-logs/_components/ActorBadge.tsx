'use client'

import { ActorType } from '@/generated/prisma/enums'
import { IconCpu, IconShieldCheck, IconUser } from '@tabler/icons-react'

import { ACTOR_TYPE_CONFIG } from '@/utils/activity/formatter'

interface ActorBadgeProps {
  actorType: ActorType
  showIcon?: boolean
  className?: string
}

export function ActorBadge({
  actorType,
  showIcon = true,
  className = '',
}: ActorBadgeProps) {
  const config = ACTOR_TYPE_CONFIG[actorType] || {
    label: actorType,
    desc: '',
    badgeClass: 'bg-muted text-foreground border-border',
  }

  const IconComponent =
    actorType === ActorType.SYSTEM
      ? IconCpu
      : actorType === ActorType.SUPER_ADMIN
        ? IconShieldCheck
        : IconUser

  return (
    <span
      title={config.desc}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium tracking-tight whitespace-nowrap ${config.badgeClass} ${className}`}
    >
      {showIcon && <IconComponent size={12} className="shrink-0 opacity-80" />}
      <span>{config.label}</span>
    </span>
  )
}
