'use client'

import { PRODUCTS } from '@/constants/sites/product'
import { useCarousel } from '@/hooks/use-carousel'
import { useRandomGradient } from '@/hooks/use-random-gradient'
import { Category } from '@/types/sites/category'

import { SectionContainer } from '@/components/SectionContainer'

import { SeeMoreButton } from '../SeeMoreButton'
import { ProductCard } from '../product/ProductCard'

export function CategorySection({ categoryId, title, image }: Category) {
  const fallbackGradient = useRandomGradient()
  const { emblaRef } = useCarousel()

  const filteredProducts = PRODUCTS.filter(
    (product) => product.categoryId === categoryId,
  )

  if (filteredProducts.length === 0) {
    return null
  }

  return (
    <SectionContainer>
      <div className="flex w-full flex-col gap-6 md:flex-row">
        <div
          className="relative h-96 w-full shrink-0 rounded-xl bg-gray-200 bg-cover bg-center text-start md:w-72"
          style={{
            backgroundImage: image ? `url('${image}')` : fallbackGradient,
          }}
          suppressHydrationWarning
        >
          <div className="absolute inset-0 rounded-xl bg-black/20" />
          <h2 className="relative z-10 p-5 text-4xl font-bold text-white drop-shadow-md">
            {title}
          </h2>
        </div>

        <div className="relative w-full overflow-hidden" ref={emblaRef}>
          <div className="flex h-87.5 items-center gap-5">
            {filteredProducts.map((product) => (
              <div
                key={product.productId}
                className="h-full min-w-0 flex-[0_0_288px]"
              >
                <ProductCard variant="shadow" {...product} />
              </div>
            ))}

            <SeeMoreButton href="/products" />
          </div>

          <div className="pointer-events-none absolute top-0 right-0 z-10 h-full w-10 bg-linear-to-l from-white to-transparent" />
        </div>
      </div>
    </SectionContainer>
  )
}
