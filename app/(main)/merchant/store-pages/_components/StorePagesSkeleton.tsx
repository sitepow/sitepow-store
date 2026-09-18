'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function StorePagesSkeleton() {
  return (
    <div className="flex flex-col gap-6 xl:flex-row">
      <div className="flex h-auto w-full shrink-0 flex-col gap-1.5 rounded-xl border p-1.5 xl:sticky xl:top-5 xl:w-64">
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
        <Skeleton className="h-9 w-full rounded-lg" />
      </div>
      <Card className="min-w-0 flex-1">
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-96 w-full rounded-xl" />
        </CardContent>
      </Card>
    </div>
  )
}
