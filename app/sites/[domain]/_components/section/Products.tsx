import { PRODUCTS } from '@/constants/sites/product'

import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeader } from '@/components/SectionHeader'

import { SeeMoreButton } from '../SeeMoreButton'
import { ProductCard } from '../product/ProductCard'

export function ProductsSection() {
  return (
    <SectionContainer>
      <SectionHeader title="สินค้าใหม่" />

      <div className="grid w-full gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {PRODUCTS.map((product) => {
          return <ProductCard key={product.productId} {...product} />
        })}
      </div>

      <SeeMoreButton href="/products" />
    </SectionContainer>
  )
}
