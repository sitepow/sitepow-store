// import { PRODUCTS } from '@/constants/sites/product'
import { StorePageProps } from '@/types/sites/page'

// import { Product } from '@/types/sites/product'

import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../../_components/layout/Layout'
import { ProductGallery } from '../../_components/product/ProductGallery'
// import { ProductPurchasePanel } from '../../_components/product/ProductPurchasePanel'
import { ProductReviewLists } from '../../_components/product/ProductReviewLists'
import { ProductSpecification } from '../../_components/product/ProductSpecification'

export default async function StoreProductDescriptionPage({
  params,
}: StorePageProps) {
  // const { slug } = await params
  // const product = PRODUCTS.find((product) => product.slug === slug) as Product

  return (
    <StoreLayout>
      <SectionContainer>
        <div className="grid w-full items-start gap-x-10 gap-y-5 text-start xl:grid-cols-12">
          <div className="flex flex-col gap-5 xl:col-span-7">
            <ProductGallery />
          </div>

          <div className="flex flex-col gap-5 xl:sticky xl:top-40 xl:col-span-5 xl:col-start-8 xl:row-start-1 xl:row-end-3">
            {/* <ProductPurchasePanel product={product} /> */}
          </div>

          <div className="xl:col-span-7">
            <ProductSpecification />
            <ProductReviewLists />
          </div>
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
