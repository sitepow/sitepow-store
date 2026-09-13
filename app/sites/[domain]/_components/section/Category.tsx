'use client'

import { useCallback, useEffect, useState } from 'react'

import { useLocale } from 'next-intl'

import { SectionProductItem } from '@/actions/storefront/sections'
import { useCarousel } from '@/hooks/use-carousel'
import { useLandingImages } from '@/hooks/use-landing-images'
import { getLocalizedField } from '@/utils/intl'
import { isVideoUrl } from '@/utils/media'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { SectionContainer } from '@/components/SectionContainer'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { SeeMoreButton } from '../SeeMoreButton'
import { ProductCard } from '../product/ProductCard'

interface CategorySectionProps {
  categorySlug: string
  title: string
  image?: string | null
  translations?: any
  products: SectionProductItem[]
  isLoading: boolean
}

export function CategorySection({
  categorySlug,
  title,
  image,
  translations,
  products,
  isLoading,
}: CategorySectionProps) {
  const locale = useLocale()
  const displayTitle =
    getLocalizedField({ title, translations }, 'title', locale) || title
  const { currentImage } = useLandingImages({ imageFolder: 'shelf' })
  const { emblaRef, emblaApi: api } = useCarousel({
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

  const displayMedia = image || currentImage

  if (products.length === 0) {
    return null
  }

  return (
    <SectionContainer>
      <div className="flex w-full min-w-0 flex-col gap-6 md:flex-row md:items-stretch">
        {isLoading ? (
          <Skeleton className="h-44 w-full shrink-0 rounded-2xl md:h-96 md:w-80 lg:w-96" />
        ) : (
          <div className="border-border/50 group relative flex h-44 w-full shrink-0 overflow-hidden rounded-2xl border bg-neutral-900 text-start sm:h-56 md:h-auto md:w-80 lg:w-96">
            <div className="absolute inset-0 z-0 transition-transform duration-700 group-hover:scale-105">
              {displayMedia && isVideoUrl(displayMedia) ? (
                <video
                  src={displayMedia}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="size-full object-cover opacity-50"
                />
              ) : (
                <div
                  className="animate-ken-burns size-full bg-cover bg-center opacity-50"
                  style={{
                    backgroundImage: displayMedia
                      ? `url('${displayMedia}')`
                      : undefined,
                  }}
                />
              )}
            </div>
            <div className="absolute inset-0 z-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
            <div className="relative z-10 flex size-full flex-col justify-end p-5 sm:p-6">
              <h2 className="line-clamp-2 text-xl font-extrabold tracking-tight text-white drop-shadow-md sm:text-2xl md:text-3xl">
                {displayTitle}
              </h2>
            </div>
          </div>
        )}
        <div className="group/carousel relative flex w-full min-w-0 flex-1 items-center">
          {canScrollPrev && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => api?.scrollPrev()}
              className="border-border/50 bg-background/80 absolute -left-3 z-20 hidden size-9 rounded-full shadow-md backdrop-blur-md transition-all group-hover/carousel:flex hover:scale-105"
            >
              <ChevronLeft className="size-5" />
            </Button>
          )}
          <div
            ref={emblaRef}
            className="w-full min-w-0 cursor-grab overflow-hidden p-1 active:cursor-grabbing"
          >
            <div className="flex items-stretch gap-2.5">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="h-72 min-w-0 flex-[0_0_160px] rounded-xl sm:flex-[0_0_200px]"
                    />
                  ))
                : products.map((product) => (
                    <div
                      key={product.id}
                      className="flex-[0_0_160px] sm:flex-[0_0_200px] lg:flex-[0_0_220px]"
                    >
                      <ProductCard product={product} className="h-full" />
                    </div>
                  ))}
              {!isLoading && (
                <div className="flex flex-[0_0_140px] items-center justify-center sm:flex-[0_0_180px]">
                  <SeeMoreButton href={`/products?category=${categorySlug}`} />
                </div>
              )}
            </div>
          </div>
          {canScrollNext && (
            <Button
              variant="outline"
              size="icon"
              onClick={() => api?.scrollNext()}
              className="border-border/50 bg-background/80 absolute -right-3 z-20 hidden size-9 rounded-full shadow-md backdrop-blur-md transition-all group-hover/carousel:flex hover:scale-105"
            >
              <ChevronRight className="size-5" />
            </Button>
          )}
          <div className="from-background pointer-events-none absolute top-0 right-0 z-10 h-full w-12 bg-linear-to-l to-transparent opacity-80" />
        </div>
      </div>
    </SectionContainer>
  )
}
