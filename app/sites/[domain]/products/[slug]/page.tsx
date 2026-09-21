import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../../_components/layout/Layout'
import { ProductGallery } from './_components/ProductGallery'
import { ProductPurchasePanel } from './_components/ProductPurchasePanel'
import { ProductRelated } from './_components/ProductRelated'
import { ProductReviewLists } from './_components/ProductReviewLists'
import { ProductSpecification } from './_components/ProductSpecification'

type Props = {
  params: Promise<{ domain: string; slug: string }>
}

export default async function StoreProductDescriptionPage({ params }: Props) {
  const { domain, slug } = await params

  return (
    <StoreLayout>
      <SectionContainer>
        <div className="text-foreground grid w-full items-start gap-x-10 gap-y-5 text-start xl:grid-cols-12">
          <div className="flex flex-col gap-5 xl:col-span-7">
            <ProductGallery />
          </div>
          <div className="flex flex-col gap-5 xl:sticky xl:top-40 xl:col-span-5 xl:col-start-8 xl:row-start-1 xl:row-end-3">
            <ProductPurchasePanel storeSlug={domain} productSlug={slug} />
          </div>
          <div className="xl:col-span-7">
            <ProductSpecification />
            <ProductReviewLists />
          </div>
        </div>
        <div className="flex w-full">
          <ProductRelated />
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
