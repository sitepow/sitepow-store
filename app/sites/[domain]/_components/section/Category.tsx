'use client'

import { SectionProductItem } from '@/actions/storefront/sections'
import { useCarousel } from '@/hooks/use-carousel'
import { useRandomGradient } from '@/hooks/use-random-gradient'

import { SectionContainer } from '@/components/SectionContainer'

import { SeeMoreButton } from '../SeeMoreButton'
import { ProductCard } from '../product/ProductCard'

interface CategorySectionProps {
  categorySlug: string
  title: string
  image?: string | null
  products: SectionProductItem[]
}

export function CategorySection({
  categorySlug,
  title,
  image,
  products,
}: CategorySectionProps) {
  const fallbackGradient = useRandomGradient()
  const { emblaRef } = useCarousel()

  if (products.length === 0) {
    return null
  }

  return (
    <SectionContainer>
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div
          className="animate-gradient relative h-48 w-full shrink-0 rounded-xl bg-gray-200 bg-cover bg-center text-start md:h-88.75 md:w-72"
          style={{
            backgroundImage: image ? `url('${image}')` : fallbackGradient,
          }}
          suppressHydrationWarning
        >
          <div className="absolute inset-0 rounded-xl bg-black/20" />
          <div className="p-5">
            <h2 className="relative z-10 line-clamp-2 text-2xl font-bold break-all whitespace-normal text-white drop-shadow-md md:text-4xl">
              {title}
            </h2>
          </div>
        </div>

        <div className="relative w-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-87.5 items-center gap-5 p-2.5">
            {products.map((product) => (
              <div key={product.id} className="h-full min-w-0 flex-[0_0_288px]">
                <ProductCard product={product} variant="shadow" />
              </div>
            ))}
            <SeeMoreButton href={`/products?category=${categorySlug}`} />
          </div>
          <div className="from-background pointer-events-none absolute top-0 right-0 z-10 h-full w-10 bg-linear-to-l to-transparent" />
        </div>
      </div>
    </SectionContainer>
  )
}
