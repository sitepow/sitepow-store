/* eslint-disable @next/next/no-img-element */
'use client'

import { useCallback, useEffect, useState } from 'react'

import { useCarousel } from '@/hooks/use-carousel'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useMediaQuery } from '@/hooks/use-media-query'
import { isVideoUrl } from '@/utils/media'
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { cn } from '@/lib/utils'

import { useProductPurchaseStore } from '../../store'

export function ProductGalleryThumbnail() {
  const { product, isLoading, activeImageIndex, setActiveImageIndex } =
    useProductPurchaseStore()

  const isMounted = useIsMounted()
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const images = product?.images ?? []

  const { emblaRef, emblaApi: api } = useCarousel({
    axis: isDesktop ? 'y' : 'x',
    dragFree: true,
    containScroll: false,
  })

  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const onSelect = useCallback(() => {
    if (!api) return
    setCanScrollPrev(api.canScrollPrev())
    setCanScrollNext(api.canScrollNext())
  }, [api])

  useEffect(() => {
    if (!api) return
    onSelect()
    api.on('select', onSelect)
    api.on('reInit', onSelect)
  }, [api, onSelect])

  const scrollPrev = () => api?.scrollPrev()
  const scrollNext = () => api?.scrollNext()

  if (!isMounted) {
    return null
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
      className={cn(
        'relative flex items-center justify-center gap-1',
        isDesktop ? 'h-64 flex-col' : 'w-full max-w-xs flex-row',
      )}
    >
      <Button
        variant="ghost"
        size="icon"
        disabled={!canScrollPrev}
        className="z-10 size-7 flex-none rounded-full p-0 disabled:opacity-30"
        onClick={scrollPrev}
      >
        {isDesktop ? (
          <ChevronUp className="size-5" />
        ) : (
          <ChevronLeft className="size-5" />
        )}
      </Button>
      <div
        key={isDesktop ? 'desktop' : 'mobile'}
        ref={emblaRef}
        className={cn(
          'min-w-0 flex-1 cursor-grab overflow-hidden active:cursor-grabbing',
          isDesktop ? 'h-64 w-24' : 'w-full',
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
      <Button
        variant="ghost"
        size="icon"
        disabled={!canScrollNext}
        className="z-10 size-7 flex-none rounded-full p-0 disabled:opacity-30"
        onClick={scrollNext}
      >
        {isDesktop ? (
          <ChevronDown className="size-5" />
        ) : (
          <ChevronRight className="size-5" />
        )}
      </Button>
    </div>
  )
}
