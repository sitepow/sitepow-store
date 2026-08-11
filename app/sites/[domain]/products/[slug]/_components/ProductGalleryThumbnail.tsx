/* eslint-disable @next/next/no-img-element */
'use client'

import { useCarousel } from '@/hooks/use-carousel'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useMediaQuery } from '@/hooks/use-media-query'
import { isVideoUrl } from '@/utils/media'

import { Skeleton } from '@/components/ui/skeleton'

import { cn } from '@/lib/utils'

import { useProductPurchaseStore } from '../../store'

export function ProductGalleryThumbnail() {
  const { product, isLoading, activeImageIndex, setActiveImageIndex } =
    useProductPurchaseStore()

  const isMounted = useIsMounted()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const images = product?.images ?? []

  const { emblaRef } = useCarousel({
    axis: isDesktop ? 'y' : 'x',
    dragFree: true,
    containScroll: 'keepSnaps',
  })

  if (!isMounted) {
    return
  }

  if (isLoading) {
    return (
      <div className={cn('flex gap-2', isDesktop ? 'flex-col' : 'flex-row')}>
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="size-16 flex-none md:size-20" />
        ))}
      </div>
    )
  }

  if (images?.length === 0) {
    return (
      <div className={cn('flex gap-2', isDesktop ? 'flex-col' : 'flex-row')}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="border-primary border border-dashed p-1">
            <div className="bg-foreground/10 size-16 md:size-20" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div
      key={isDesktop ? 'desktop' : 'mobile'}
      ref={emblaRef}
      className={cn(
        'cursor-grab overflow-hidden active:cursor-grabbing',
        isDesktop ? 'h-125 w-24' : 'w-full',
      )}
    >
      <div className={cn('flex gap-2', isDesktop ? 'flex-col' : 'flex-row')}>
        {images.map((image, index) => (
          <div
            key={image.id || index}
            onClick={() => setActiveImageIndex(index)}
            className={cn(
              'border-border relative aspect-square size-16 flex-none cursor-pointer overflow-hidden border border-dashed bg-transparent p-1 transition-all md:size-20',
              activeImageIndex === index ? 'border-primary' : 'border-muted',
            )}
          >
            {isVideoUrl(image.url) ? (
              <video
                src={image.url}
                className="size-full object-cover object-center"
                muted
              />
            ) : (
              <img
                src={image.url}
                alt={`Product ${index}`}
                className="size-full object-cover object-center"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
