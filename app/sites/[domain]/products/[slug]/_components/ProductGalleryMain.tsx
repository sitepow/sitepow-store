/* eslint-disable @next/next/no-img-element */
import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../store'

export function ProductGalleryMain() {
  const { product, isLoading, activeImageIndex } = useProductPurchaseStore()

  const isVideo = (url: string) => url.match(/\.(mp4|webm|ogg)$/i)
  const activeImage = product?.images?.[activeImageIndex]

  if (isLoading) {
    return (
      <Skeleton className="aspect-square w-full rounded-xl md:aspect-4/3" />
    )
  }

  if (!activeImage) {
    return (
      <div className="bg-muted flex aspect-square w-full items-center justify-center rounded-xl md:aspect-4/3">
        ไม่มีรูปภาพ
      </div>
    )
  }

  return (
    <div className="flex aspect-square h-52 w-full items-center justify-center overflow-hidden rounded-xl bg-gray-50 md:aspect-4/3 md:h-full">
      {isVideo(activeImage.url) ? (
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
