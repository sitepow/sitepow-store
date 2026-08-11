/* eslint-disable @next/next/no-img-element */
import { isVideoUrl } from '@/utils/media'

import { Skeleton } from '@/components/ui/skeleton'

import { EmptyImage } from '../../../_components/EmptyImage'
import { useProductPurchaseStore } from '../../store'

export function ProductGalleryMain() {
  const { product, isLoading, activeImageIndex } = useProductPurchaseStore()

  const activeImage = product?.images?.[activeImageIndex]

  if (isLoading) {
    return <Skeleton className="aspect-square w-full md:aspect-4/3" />
  }

  if (!activeImage) {
    return <EmptyImage className="aspect-square w-full md:aspect-4/3" />
  }

  return (
    <div className="flex aspect-square h-52 w-full items-center justify-center overflow-hidden bg-gray-50 md:aspect-4/3 md:h-full">
      {isVideoUrl(activeImage.url) ? (
        <video
          key={activeImage.url}
          src={activeImage.url}
          className="size-full object-contain"
          controls
          autoPlay
          muted
        />
      ) : (
        <img
          key={activeImage.url}
          src={activeImage.url}
          alt="Main Product"
          className="size-full object-contain"
        />
      )}
    </div>
  )
}
