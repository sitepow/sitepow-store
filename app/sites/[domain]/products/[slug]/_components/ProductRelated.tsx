'use client'

import { useRelatedProducts } from '@/actions/hooks/storefront/product'
import { useCarousel } from '@/hooks/use-carousel'

import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { SeeMoreButton } from '../../../_components/SeeMoreButton'
import { ProductCard } from '../../../_components/product/ProductCard'
import { useProductPurchaseStore } from '../../store'

export function ProductRelated() {
  const { emblaRef } = useCarousel()
  const product = useProductPurchaseStore((s) => s.product)
  const { data: products, isLoading } = useRelatedProducts(
    product?.id ?? '',
    product?.category?.id ?? '',
  )

  if (!isLoading && (!products || products.length === 0)) {
    return null
  }

  return (
    <section
      aria-labelledby="related-products-heading"
      className="w-full space-y-6 overflow-hidden"
    >
      <div className="flex items-center gap-2">
        <h2
          id="related-products-heading"
          className="text-foreground text-xl font-bold"
        >
          สินค้าใกล้เคียง
        </h2>
        <Separator className="flex-1" />
      </div>
      <div className="w-full overflow-hidden">
        <div className="overflow-hidden" ref={emblaRef}>
          <ul
            role="list"
            aria-label="รายการสินค้าใกล้เคียง"
            className="flex items-center gap-2.5"
          >
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <li
                    key={i}
                    className="list-none h-75 min-w-37.5 flex-[0_0_150px] rounded-xl sm:flex-[0_0_200px] lg:flex-[0_0_220px]"
                  >
                    <Skeleton className="size-full rounded-xl" />
                  </li>
                ))
              : products?.map((p) => (
                  <li
                    key={p.id}
                    className="list-none h-fit min-w-0 flex-[0_0_150px] sm:flex-[0_0_200px] lg:flex-[0_0_220px]"
                  >
                    <ProductCard product={p} />
                  </li>
                ))}
            {!isLoading && (
              <li className="list-none flex-[0_0_auto] px-2">
                <SeeMoreButton
                  href={`/products?category=${product?.category?.slug}`}
                />
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
