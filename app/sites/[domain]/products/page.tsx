import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../_components/layout/Layout'
import { ProductFilterControl } from './_components/ProductFilterControl'
import { ProductFilterResults } from './_components/ProductFilterResults'

export default function StoreProductPage() {
  return (
    <StoreLayout>
      <SectionContainer>
        <div className="grid w-full items-start gap-10 xl:grid-cols-12">
          <ProductFilterControl />
          <ProductFilterResults />
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
