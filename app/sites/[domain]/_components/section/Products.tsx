'use client'

import { useStorefrontProducts } from '@/actions/hooks/storefront/product'

import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeader } from '@/components/SectionHeader'
import { Skeleton } from '@/components/ui/skeleton'

import { SeeMoreButton } from '../SeeMoreButton'
import { ProductCard } from '../product/ProductCard'

export function ProductsSection({ storeSlug }: { storeSlug: string }) {
  const { data, isLoading } = useStorefrontProducts({ storeSlug, limit: 8 })
  const products = data?.data ?? []

  if (!isLoading && products.length === 0) {
    return null
  }

  return (
    <SectionContainer>
      <SectionHeader title="สินค้าใหม่" />

      <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {isLoading
          ? Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-72 w-full rounded-xl" />
            ))
          : products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                variant="outline"
              />
            ))}
      </div>

      {!isLoading && <SeeMoreButton href="/products" />}
    </SectionContainer>
  )
}
