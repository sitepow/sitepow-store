'use client'

import React from 'react'

import { useCurrentStore } from '@/hooks/use-current-store'

import { Skeleton } from '@/components/ui/skeleton'

export function AnalyticsSkeleton() {
  const { currentStore, store } = useCurrentStore()

  return (
    <div
      className="space-y-6"
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Skeleton className="h-96" />
        <Skeleton className="h-96" />
      </div>
    </div>
  )
}
