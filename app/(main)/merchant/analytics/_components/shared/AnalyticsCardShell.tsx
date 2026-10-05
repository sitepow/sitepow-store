'use client'

import { ReactNode } from 'react'
import { IconChartBar } from '@tabler/icons-react'

import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface AnalyticsCardShellProps {
  title: string
  description?: string
  isEmpty?: boolean
  emptyMessage?: string
  children?: ReactNode
  className?: string
  headerClassName?: string
  contentClassName?: string
  icon?: React.ComponentType<{ className?: string }>
  action?: ReactNode
  badge?: ReactNode
  footer?: ReactNode
  loading?: boolean
}

export function AnalyticsCardShell({
  title,
  description,
  isEmpty = false,
  emptyMessage = 'ไม่มีข้อมูล',
  children,
  className,
  headerClassName,
  contentClassName,
  icon: Icon,
  action,
  badge,
  footer,
  loading = false,
}: AnalyticsCardShellProps) {
  if (loading) {
    return (
      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs',
          className,
        )}
      >
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-3.5 w-64" />
          </div>
          <Skeleton className="h-8 w-20 rounded-lg" />
        </div>
        <div className="mt-6">
          <Skeleton className="h-60 w-full rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group/shell relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-all duration-200 hover:border-border/90 hover:shadow-sm',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity duration-300 group-hover/shell:opacity-100" />
      <div
        className={cn(
          'flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between px-5 pt-5 pb-3 sm:px-6 sm:pt-6',
          headerClassName,
        )}
      >
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {Icon && (
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20 shrink-0">
                <Icon className="size-4 stroke-[1.8]" />
              </div>
            )}
            <h3 className="font-heading text-base font-semibold tracking-tight text-foreground">
              {title}
            </h3>
            {badge && <div className="shrink-0">{badge}</div>}
          </div>
          {description && (
            <p className="text-xs text-muted-foreground leading-normal line-clamp-2">
              {description}
            </p>
          )}
        </div>
        {action && (
          <div className="flex items-center gap-2 pt-1 sm:pt-0 shrink-0">
            {action}
          </div>
        )}
      </div>
      {(children !== undefined || isEmpty) && (
        <div className={cn('px-5 pb-5 sm:px-6 sm:pb-6', contentClassName)}>
          {isEmpty ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/70 bg-muted/15 py-10 px-4 text-center">
              <div className="flex size-11 items-center justify-center rounded-xl bg-muted/80 text-muted-foreground ring-1 ring-border/50">
                <IconChartBar className="size-5 stroke-[1.5]" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                {emptyMessage}
              </p>
              <p className="mt-1 text-xs text-muted-foreground max-w-xs leading-normal">
                ยังไม่มีข้อมูลสรุปสำหรับช่วงเวลานี้ ข้อมูลจะปรากฏเมื่อมีการทำรายการ
              </p>
            </div>
          ) : (
            children
          )}
        </div>
      )}
      {footer && (
        <div className="border-t border-border/50 bg-muted/20 px-5 py-3 sm:px-6">
          {footer}
        </div>
      )}
    </div>
  )
}
