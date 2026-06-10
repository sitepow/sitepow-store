import { useCarousel } from '@/hooks/use-carousel'

import { useProductPurchaseStore } from '../../products/store'

export function ProductGalleryThumbnail() {
  const { product } = useProductPurchaseStore()
  const images = product?.images

  const { emblaRef } = useCarousel({
    dragFree: true,
    containScroll: 'keepSnaps',
  })

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
            className="size-14 flex-none rounded-sm bg-gray-100 md:size-20 md:rounded-xl"
          />
        ))}
      </div>
    </div>
  )
}
