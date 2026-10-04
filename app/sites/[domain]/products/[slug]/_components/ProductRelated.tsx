'use client'

import { useRelatedProducts } from '@/actions/storefront/product/hooks'
import { useCarousel } from '@/hooks/use-carousel'

import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { SeeMoreButton } from '../../../_components/shared/SeeMoreButton'
import { ProductCard } from '../../../_components/product/ProductCard'
import { useProductPurchaseStore } from '../../store'

interface Props {
  productId?: string
  categoryId?: string
  categorySlug?: string
}

export function ProductRelatedSkeleton() {
  return (
    <section
      aria-label="กำลังโหลดสินค้าใกล้เคียง"
      className="w-full space-y-6 overflow-hidden"
    >
      <div className="flex items-center gap-2">
        <h2 className="text-foreground text-xl font-bold">สินค้าใกล้เคียง</h2>
        <Separator className="flex-1" />
      </div>
      <div className="flex items-center gap-2.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-75 min-w-37.5 flex-[0_0_150px] rounded-xl sm:flex-[0_0_200px] lg:flex-[0_0_220px]"
          >
            <Skeleton className="size-full rounded-xl" />
          </div>
        ))}
      </div>
    </section>
  )
}

export function ProductRelated({ productId, categoryId, categorySlug }: Props) {
  const { emblaRef } = useCarousel()
  const storeProduct = useProductPurchaseStore((s) => s.product)

  const activeProductId = productId || storeProduct?.id || ''
  const activeCategoryId = categoryId || storeProduct?.category?.id || ''
  const activeCategorySlug = categorySlug || storeProduct?.category?.slug || ''

  const { data: products, isLoading } = useRelatedProducts(
    activeProductId,
    activeCategoryId,
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
                    className="h-75 min-w-37.5 flex-[0_0_150px] rounded-xl sm:flex-[0_0_200px] lg:flex-[0_0_220px] list-none"
                  >
                    <Skeleton className="size-full rounded-xl" />
                  </li>
                ))
              : products?.map((p) => (
                  <li
                    key={p.id}
                    className="h-fit min-w-0 flex-[0_0_150px] sm:flex-[0_0_200px] lg:flex-[0_0_220px] list-none"
                  >
                    <ProductCard product={p} />
                  </li>
                ))}
            {!isLoading && activeCategorySlug && (
              <li className="flex-[0_0_auto] px-2 list-none">
                <SeeMoreButton
                  href={`/products?category=${activeCategorySlug}`}
                />
              </li>
            )}
          </ul>
        </div>
      </div>
    </section>
  )
}
