import { PRODUCTS } from '@/constants/sites/product'
import { StorePageProps } from '@/types/sites/page'
import { Product } from '@/types/sites/product'

import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../../_components/layout/Layout'
import { ProductGallery } from '../../_components/product/ProductGallery'
import { ProductPurchasePanel } from '../../_components/product/ProductPurchasePanel'
import { ProductReviewLists } from '../../_components/product/ProductReviewLists'
import { ProductSpecification } from '../../_components/product/ProductSpecification'

export default async function StoreProductDescriptionPage({
  params,
}: StorePageProps) {
  const { slug } = await params
  const product = PRODUCTS.find((product) => product.slug === slug) as Product

  return (
    <StoreLayout>
      <SectionContainer>
        <div className="grid w-full grid-cols-12 items-start gap-10 text-start">
          <div className="sticky top-40 col-span-7 flex flex-col gap-5">
            <ProductGallery />
            <ProductSpecification />
            <ProductReviewLists />
          </div>

          <div className="sticky top-40 col-span-5 flex flex-col gap-5">
            <ProductPurchasePanel product={product} />
          </div>
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
