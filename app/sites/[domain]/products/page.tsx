import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../_components/layout/Layout'
import { ProductFilterControl } from './_components/ProductFilterControl'
import { ProductFilterResults } from './_components/ProductFilterResults'

type Props = {
  params: Promise<{ domain: string }>
}

export default async function StoreProductPage({ params }: Props) {
  const { domain } = await params

  return (
    <StoreLayout>
      <SectionContainer>
        <div className="grid w-full items-start gap-10 xl:grid-cols-12">
          <ProductFilterControl storeSlug={domain} />
          <ProductFilterResults storeSlug={domain} />
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
