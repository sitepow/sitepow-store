import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../products/store'

export function ProductGalleryMain() {
  const isLoading = useProductPurchaseStore((s) => s.isLoading)

  if (isLoading) {
    return <Skeleton className="h-96 w-full rounded-xl" />
  }

  return <div className="h-96 rounded-xl bg-gray-100" />
}
