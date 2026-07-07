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
    <div className="w-full space-y-6 overflow-hidden">
      <div className="flex items-center gap-2">
        <h3 className="text-foreground text-xl font-bold">สินค้าใกล้เคียง</h3>
        <Separator className="flex-1" />
      </div>
      <div className="w-full overflow-hidden p-2.5">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex items-center gap-5">
            {isLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-75 min-w-37.5 flex-[0_0_150px] rounded-xl sm:flex-[0_0_200px] lg:flex-[0_0_220px]"
                  />
                ))
              : products?.map((p) => (
                  <div
                    key={p.id}
                    className="h-fit min-w-0 flex-[0_0_150px] sm:flex-[0_0_200px] lg:flex-[0_0_220px]"
                  >
                    <ProductCard variant="shadow" product={p} />
                  </div>
                ))}
            {!isLoading && (
              <div className="flex-[0_0_auto] px-2">
                <SeeMoreButton
                  href={`/products?category=${product?.category?.slug}`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
