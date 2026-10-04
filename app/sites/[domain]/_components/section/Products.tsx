'use client'

import { useStorefrontProducts } from '@/actions/storefront/product/hooks'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { SectionContainer } from '@/components/layout/SectionContainer'
import { SectionHeader } from '@/components/layout/SectionHeader'
import { Skeleton } from '@/components/ui/skeleton'

import { SeeMoreButton } from '../SeeMoreButton'
import { ProductCard } from '../product/ProductCard'

export function ProductsSection({ storeSlug }: { storeSlug: string }) {
  const { data, isLoading } = useStorefrontProducts({ storeSlug, limit: 8 })
  const products = data?.data ?? []

  if (!isLoading && products.length === 0) {
    return (
      <SectionContainer>
        <ActionRequiredAlert
          className="w-fit"
          title="ขออภัย"
          description="ไม่พบสินค้าในระบบที่คุณกำลังค้นหา โปรดติดต่อร้านค้าโดยตรง"
        />
      </SectionContainer>
    )
  }

  return (
    <SectionContainer>
      <SectionHeader title="สินค้าใหม่" />

      <ul
        role="list"
        aria-label="รายการสินค้าใหม่"
        className="grid w-full grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6"
      >
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="list-none">
                <Skeleton className="h-72 w-full rounded-xl" />
              </li>
            ))
          : products.map((product) => (
              <li key={product.id} className="list-none" itemProp="itemListElement">
                <ProductCard product={product} />
              </li>
            ))}
      </ul>

      {!isLoading && <SeeMoreButton href="/products" />}
    </SectionContainer>
  )
}
