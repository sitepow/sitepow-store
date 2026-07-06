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

  const isVideo =
    image?.match(/\.(mp4|webm|ogg)$/i) ||
    currentImage?.match(/\.(mp4|webm|ogg)$/i)
  const displayMedia = image || currentImage

  if (products.length === 0) {
    return null
  }

  return (
    <SectionContainer>
      <div className="flex w-full flex-col gap-6 md:flex-row">
        {isLoading ? (
          <Skeleton className="h-48 w-full shrink-0 rounded-xl md:h-88.75 md:w-96" />
        ) : (
          <div className="border-border relative h-48 w-full shrink-0 overflow-hidden rounded-xl border bg-neutral-900 text-start sm:h-64 md:h-88.75 md:w-96">
            <div className="absolute inset-0 z-0">
              {isVideo ? (
                <video
                  src={displayMedia ?? ''}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="animate-ken-burns size-full object-cover opacity-40"
                />
              ) : (
                <div
                  className="animate-ken-burns size-full bg-cover bg-center opacity-40"
                  style={{ backgroundImage: `url('${displayMedia}')` }}
                />
              )}
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
          <div className="flex items-center gap-5">
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
                    className="h-fit min-w-0 flex-[0_0_150px] sm:flex-[0_0_200px] lg:flex-[0_0_220px]"
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
