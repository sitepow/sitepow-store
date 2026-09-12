'use client'

import React from 'react'

import { IconArrowDownRight, IconArrowUpRight } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  icon?: React.ComponentType<{ className?: string; size?: number }>
  trend?: {
    value: number | string
    isPositive?: boolean
    label?: string
  }
  badge?: string
  className?: string
  valueClassName?: string
  action?: React.ReactNode
  children?: React.ReactNode
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  badge,
  className,
  valueClassName,
  action,
  children,
}: StatsCardProps) {
  // Automatically extract inline trend from description if present (e.g., "+12.5%", "-3.2%")
  const descTrend = React.useMemo(() => {
    if (trend) return trend
    if (!description) return null

    const match = description.match(/^([+-]\s*[\d,]+(?:\.\d+)?%?)/)
    if (match) {
      const isPositive = match[1].startsWith('+')
      const rest = description.replace(match[0], '').trim()
      return {
        value: match[1].replace(/\s+/g, ''),
        isPositive,
        label: rest,
      }
    }
    return null
  }, [description, trend])

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-hidden rounded-2xl border',
        'border-border/70 bg-card/85 p-4.5 backdrop-blur-md transition-all duration-300 sm:p-5',
        'hover:border-primary/40 hover:shadow-primary/5 hover:-translate-y-0.5 hover:shadow-lg',
        'dark:bg-card/40 dark:hover:border-primary/30 dark:border-white/10',
        className,
      )}
    >
      {/* Ambient Top-Right Corner Glow on Hover */}
      <div
        className="bg-primary/10 dark:bg-primary/15 pointer-events-none absolute -top-10 -right-10 size-28 rounded-full opacity-0 blur-2xl transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
      />

      {/* Header: Title + Icon Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <span className="text-muted-foreground line-clamp-1 text-xs font-medium tracking-tight sm:text-sm">
            {title}
          </span>
          {badge && (
            <span className="bg-primary/10 text-primary inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold">
              {badge}
            </span>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              'flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-10',
              'border-primary/20 bg-primary/10 text-primary border',
              'group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-primary/25 transition-all duration-300 group-hover:scale-105 group-hover:shadow-md',
              'dark:border-primary/30 dark:bg-primary/15',
            )}
            aria-hidden="true"
          >
            <Icon className="size-4.5 transition-transform duration-300 group-hover:scale-110 sm:size-5" />
          </div>
        )}
      </div>

      {/* Metric Value & Trend / Description */}
      <div className="mt-3 space-y-1.5 sm:mt-4">
        <div
          className={cn(
            'text-foreground text-xl font-bold tracking-tight tabular-nums sm:text-2xl lg:text-[26px]',
            valueClassName,
          )}
        >
          {value}
        </div>

        {descTrend ? (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span
              className={cn(
                'inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold',
                descTrend.isPositive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
              )}
            >
              {descTrend.isPositive ? (
                <IconArrowUpRight className="size-3" />
              ) : (
                <IconArrowDownRight className="size-3" />
              )}
              {descTrend.value}
            </span>
            {descTrend.label && (
              <span className="text-muted-foreground/80 line-clamp-1 text-[11px]">
                {descTrend.label}
              </span>
            )}
          </div>
        ) : description ? (
          <p className="text-muted-foreground/85 line-clamp-2 text-xs leading-relaxed">
            {description}
          </p>
        ) : null}

        {action && <div className="pt-2">{action}</div>}
        {children}
      </div>
    </div>
  )
}
