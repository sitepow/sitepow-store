/* eslint-disable @next/next/no-img-element */
/* eslint-disable jsx-a11y/alt-text */
'use client'

import { SectionProductItem } from '@/actions/storefront/sections'
import { useCarousel } from '@/hooks/use-carousel'
import { useLandingImages } from '@/hooks/use-landing-images'

import { SectionContainer } from '@/components/SectionContainer'
import { Skeleton } from '@/components/ui/skeleton'

import { SeeMoreButton } from '../SeeMoreButton'
import { ProductCard } from '../product/ProductCard'

interface CategorySectionProps {
  categorySlug: string
  title: string
  image?: string | null
  products: SectionProductItem[]
  isLoading: boolean
}

export function CategorySection({
  categorySlug,
  title,
  image,
  products,
  isLoading,
}: CategorySectionProps) {
  const { currentImage } = useLandingImages({ imageFolder: 'shelf' })

  const { emblaRef } = useCarousel()

  if (products.length === 0) {
    return null
  }

  return (
    <SectionContainer>
      <div className="flex w-full flex-col gap-6 md:flex-row">
        {isLoading ? (
          <Skeleton className="h-48 w-full shrink-0 rounded-xl md:h-88.75 md:w-96" />
        ) : (
          <div className="border-border relative h-48 w-full shrink-0 rounded-xl border bg-neutral-900 text-start sm:h-64 md:h-88.75 md:w-96">
            <div className="absolute inset-0 z-0">
              <img
                key={currentImage}
                className="animate-in fade-in relative size-full rounded-xl bg-cover bg-center opacity-40 duration-1000"
                style={{
                  backgroundImage: image
                    ? `url('${image}')`
                    : `url('${currentImage}')`,
                }}
                onError={(e) => {
                  e.currentTarget.src = currentImage
                }}
              />
            </div>

            <div className="absolute inset-0 rounded-xl bg-black/20" />
            <div className="p-5">
              <h2 className="relative z-10 line-clamp-2 text-2xl font-bold break-all whitespace-normal text-white drop-shadow-md md:text-4xl">
                {title}
              </h2>
            </div>
          </div>
        )}

        <div className="relative w-full overflow-hidden p-2.5" ref={emblaRef}>
          <div className="flex h-87.5 items-center gap-5">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-full min-w-0 flex-[0_0_288px] rounded-xl"
                  />
                ))
              : products.map((product) => (
                  <div
                    key={product.id}
                    className="h-full min-w-0 flex-[0_0_288px]"
                  >
                    <ProductCard product={product} variant="shadow" />
                  </div>
                ))}
            {!isLoading && (
              <SeeMoreButton href={`/products?category=${categorySlug}`} />
            )}
          </div>
          <div className="from-background pointer-events-none absolute top-0 right-0 z-10 h-full w-10 bg-linear-to-l to-transparent" />
        </div>
      </div>
    </SectionContainer>
  )
}
