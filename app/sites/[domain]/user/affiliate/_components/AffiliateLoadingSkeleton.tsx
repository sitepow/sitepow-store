import { Skeleton } from '@/components/ui/skeleton'

export function AffiliateLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-44 w-full rounded-2xl" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
      </div>
    </div>
  )
}
