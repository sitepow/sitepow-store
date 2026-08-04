'use client'

import { ComponentProps, useSyncExternalStore } from 'react'

import { formatShortDate, formatShortTime } from '@/utils/date'
import { IconClock } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

function subscribe(callback: () => void) {
  const timer = setInterval(callback, 1000)
  return () => clearInterval(timer)
}

function getSnapshot() {
  return Date.now()
}

function getServerSnapshot() {
  return null
}

export function DateTimeBadge({ className, ...props }: ComponentProps<'div'>) {
  const timestamp = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  if (!timestamp) {
    return null
  }

  const date = new Date(timestamp)

  return (
    <div
      className={cn(
        'border-primary/20 bg-primary/5 text-primary flex w-fit items-center gap-2 rounded-full border p-3 text-xs',
        className,
      )}
      {...props}
    >
      <IconClock size={14} />
      <span className="font-medium">
        {formatShortDate(date)} {formatShortTime(date)}
      </span>
    </div>
  )
}
