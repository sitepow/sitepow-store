'use client'

import React from 'react'

import { useCurrentStore } from '@/hooks/use-current-store'

interface RankProgressBarProps {
  percentage: number
  isFirst: boolean
  firstGradientClass?: string
  normalBarClass?: string
}

export function RankProgressBar({
  percentage,
  isFirst,
  firstGradientClass = 'bg-linear-to-r from-amber-500 to-orange-500',
  normalBarClass = 'bg-primary/70',
}: RankProgressBarProps) {
  const { currentStore, store } = useCurrentStore()

  return (
    <div
      className="bg-muted/60 mt-2.5 h-1.5 w-full overflow-hidden rounded-full"
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      <div
        className={`h-full rounded-full transition-all duration-500 ${
          isFirst ? firstGradientClass : normalBarClass
        }`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
