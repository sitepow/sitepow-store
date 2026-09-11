'use client'

import React, { ReactNode } from 'react'

import { useTranslations } from 'next-intl'

import { useCurrentStore } from '@/hooks/use-current-store'
import { formatNumber } from '@/utils/pricing'

import { RankBadge } from './RankBadge'
import { RankProgressBar } from './RankProgressBar'

interface RankListItemProps {
  rank: number
  percentage: number
  quantityOrCount: number
  unitText?: string
  getRankStyle: (index: number) => string
  crownColorClass?: string
  firstGradientClass?: string
  normalBarClass?: string
  children: ReactNode
}

export function RankListItem({
  rank,
  percentage,
  quantityOrCount,
  unitText,
  getRankStyle,
  crownColorClass,
  firstGradientClass,
  normalBarClass,
  children,
}: RankListItemProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('common.order')
  const unit = unitText ?? t('pieces')
  const isFirst = rank === 0

  return (
    <div
      className="group border-border/40 bg-card hover:border-border relative rounded-xl border p-3 transition-all duration-200 hover:shadow-sm"
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <RankBadge
            rank={rank}
            getRankStyle={getRankStyle}
            crownColorClass={crownColorClass}
          />
          {children}
        </div>
        <div className="shrink-0 text-right">
          <span className="text-foreground text-sm font-extrabold">
            {formatNumber(quantityOrCount)}
          </span>
          <span className="text-muted-foreground ml-1 text-xs font-medium">
            {unit}
          </span>
        </div>
      </div>
      <RankProgressBar
        percentage={percentage}
        isFirst={isFirst}
        firstGradientClass={firstGradientClass}
        normalBarClass={normalBarClass}
      />
    </div>
  )
}
