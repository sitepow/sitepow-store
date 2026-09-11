'use client'

import React from 'react'

import { useCurrentStore } from '@/hooks/use-current-store'
import { IconCrown } from '@tabler/icons-react'

interface RankBadgeProps {
  rank: number
  getRankStyle: (index: number) => string
  crownColorClass?: string
}

export function RankBadge({
  rank,
  getRankStyle,
  crownColorClass,
}: RankBadgeProps) {
  const { currentStore, store } = useCurrentStore()
  const isFirst = rank === 0

  return (
    <span
      className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-transform group-hover:scale-105 ${getRankStyle(
        rank,
      )}`}
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      {isFirst ? (
        <IconCrown
          className={`size-3.5 ${crownColorClass ?? 'fill-amber-500/30 text-amber-600 dark:text-amber-400'}`}
        />
      ) : (
        rank + 1
      )}
    </span>
  )
}
