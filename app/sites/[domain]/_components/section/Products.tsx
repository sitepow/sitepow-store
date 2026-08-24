'use client'

import { useStorefrontProducts } from '@/actions/hooks/storefront/product'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeader } from '@/components/SectionHeader'
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

      <div className="grid w-full grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ))
          : products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
      </div>

      {!isLoading && <SeeMoreButton href="/products" />}
    </SectionContainer>
  )
}
