import { PRODUCTS } from '@/constants/sites/product'
import { ArrowRightIcon } from 'lucide-react'

import { SectionContainer } from '@/components/SectionContainer'
import { Button } from '@/components/ui/button'

import { ProductCard } from '../product/ProductCard'

export function ProductsSection() {
  return (
    <SectionContainer>
      <h2 className="text-4xl leading-tight font-bold">สินค้าใหม่</h2>

      <div className="grid w-full grid-cols-4 gap-5">
        {PRODUCTS.map((product) => {
          return <ProductCard key={product.productId} {...product} />
        })}
      </div>

      <Button variant="outline">
        <span>ดูทั้งหมด</span>
        <ArrowRightIcon />
      </Button>
    </SectionContainer>
  )
}
