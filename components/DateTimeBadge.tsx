/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { ComponentProps, useEffect, useState } from 'react'

import { formatShortDate, formatShortTime } from '@/utils/date'
import { IconClock } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

export function DateTimeBadge({ className, ...props }: ComponentProps<'div'>) {
  const [timestamp, setTimestamp] = useState<number | null>(null)

  useEffect(() => {
    setTimestamp(Date.now())
    const timer = setInterval(() => setTimestamp(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  if (!timestamp) {
    return null
  }

  const date = new Date(timestamp)

  return (
    <div
      className={cn(
        'border-primary/20 bg-primary/5 text-primary flex w-fit items-center gap-2 rounded-full border p-3 text-xs font-medium',
        className,
      )}
      {...props}
    >
      <IconClock size={14} />
      {formatShortDate(date)} {formatShortTime(date)}
    </div>
  )
}
