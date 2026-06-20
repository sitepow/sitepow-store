import { useCarousel } from '@/hooks/use-carousel'

import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../products/store'

export function ProductGalleryThumbnail() {
  const { product, isLoading } = useProductPurchaseStore()
  const images = product?.images

  const { emblaRef } = useCarousel({
    dragFree: true,
    containScroll: 'keepSnaps',
  })

  if (isLoading) {
    return (
      <div className="w-full max-w-64 overflow-hidden sm:max-w-xl md:max-w-none">
        <div className="flex gap-2 px-1">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="size-14 flex-none rounded-sm md:size-20 md:rounded-xl"
            />
          ))}
        </div>
      </div>
    )
  }

  if (!images || images.length === 0) {
    return null
  }

  return (
    <div
      className="w-full max-w-64 overflow-hidden sm:max-w-xl md:max-w-none"
      ref={emblaRef}
    >
      <div className="flex gap-2 px-1">
        {images.map((image, index) => (
          <div
            key={image.id || index}
            className="bg-foreground/20 size-14 flex-none rounded-sm md:size-20 md:rounded-xl"
          />
        ))}
      </div>
    </div>
  )
}
