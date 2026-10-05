'use client'

import * as React from 'react'
import { TrendingDown, TrendingUp } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface StatsCardTrend {
  value: string | number
  isPositive?: boolean
  label?: string
}

export interface StatsCardProps {
  title: string
  value: React.ReactNode
  description?: React.ReactNode
  icon?: React.ComponentType<{ className?: string }>
  trend?: StatsCardTrend
  badge?: React.ReactNode
  className?: string
  iconClassName?: string
  valueClassName?: string
  loading?: boolean
}

function renderSmartDescription(description: React.ReactNode) {
  if (typeof description !== 'string') {
    return description
  }

  const match = description.match(/([\+\-]\d+(?:\.\d+)?%)/)
  if (!match || match.index === undefined) {
    return description
  }

  const trendText = match[0]
  const isPositive = trendText.startsWith('+')
  const isNegative = trendText.startsWith('-')
  const before = description.slice(0, match.index)
  const after = description.slice(match.index + trendText.length)

  if (!before.trim()) {
    return (
      <span className="inline-flex items-center gap-1.5 flex-wrap">
        <span
          className={cn(
            'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tracking-tight',
            isPositive &&
              'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400',
            isNegative &&
              'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400',
            !isPositive && !isNegative && 'bg-muted text-muted-foreground'
          )}
        >
          {isPositive && <TrendingUp className="size-3 shrink-0" />}
          {isNegative && <TrendingDown className="size-3 shrink-0" />}
          {trendText}
        </span>
        {after && (
          <span className="text-muted-foreground text-xs">{after.trim()}</span>
        )}
      </span>
    )
  }

  return (
    <span>
      {before}
      <span
        className={cn(
          'font-semibold inline-flex items-center gap-0.5',
          isPositive && 'text-emerald-600 dark:text-emerald-400',
          isNegative && 'text-rose-600 dark:text-rose-400'
        )}
      >
        {isPositive && <TrendingUp className="size-2.5 shrink-0 inline" />}
        {isNegative && <TrendingDown className="size-2.5 shrink-0 inline" />}
        {trendText}
      </span>
      {after}
    </span>
  )
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  className,
  iconClassName,
  valueClassName,
  loading = false,
}: StatsCardProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card p-3.5 sm:p-5 shadow-xs',
          className
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="size-8 sm:size-9 rounded-lg sm:rounded-xl" />
        </div>
        <div className="mt-3 sm:mt-4 space-y-2">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-3.5 w-40" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group/stats relative flex flex-col justify-between overflow-hidden rounded-xl border border-border/60 bg-card/90 p-3.5 sm:p-5 shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-md hover:shadow-primary/5',
        className
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity duration-300 group-hover/stats:opacity-100" />
      <div className="pointer-events-none absolute -right-6 -top-6 size-24 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover/stats:scale-125 group-hover/stats:bg-primary/10" />
      <div className="relative flex items-center justify-between gap-2.5">
        <span className="text-xs sm:text-sm font-medium text-muted-foreground line-clamp-1 tracking-tight">
          {title}
        </span>
        {badge ? (
          <div className="shrink-0">{badge}</div>
        ) : Icon ? (
          <div
            className={cn(
              'flex size-8 sm:size-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all duration-200 group-hover/stats:scale-105 group-hover/stats:bg-primary/15 group-hover/stats:ring-primary/30',
              iconClassName
            )}
          >
            <Icon className="size-4 sm:size-4.5 stroke-[1.8]" />
          </div>
        ) : null}
      </div>
      <div className="relative mt-2.5 sm:mt-3.5 space-y-1">
        <div
          className={cn(
            'text-lg sm:text-2xl font-bold tracking-tight text-foreground font-heading tabular-nums',
            valueClassName
          )}
        >
          {value}
        </div>
        {trend ? (
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold tracking-tight',
                trend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400'
              )}
            >
              {trend.isPositive ? (
                <TrendingUp className="size-3 shrink-0" />
              ) : (
                <TrendingDown className="size-3 shrink-0" />
              )}
              {trend.value}
            </span>
            {trend.label && (
              <span className="text-muted-foreground text-xs line-clamp-1">
                {trend.label}
              </span>
            )}
          </div>
        ) : description ? (
          <div className="text-xs text-muted-foreground line-clamp-1 pt-0.5 leading-normal">
            {renderSmartDescription(description)}
          </div>
        ) : null}
      </div>
    </div>
  )
}
