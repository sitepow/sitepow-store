import { SectionContainer } from '@/components/layout/SectionContainer'

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
        <header className="mb-8 flex flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-bold text-foreground tracking-tight sm:text-3xl lg:text-4xl">
            สินค้าทั้งหมด
          </h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">
            เลือกดูและค้นหาสินค้าคุณภาพทั้งหมดจากร้านค้า
          </p>
        </header>
        <div className="grid w-full items-start gap-10 xl:grid-cols-12">
          <ProductFilterControl storeSlug={domain} />
          <ProductFilterResults storeSlug={domain} />
        </div>
      </SectionContainer>
    </StoreLayout>
  )
}
