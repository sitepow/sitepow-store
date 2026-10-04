import { HOW_TO_ORDER_PAGE } from '@/constants/storefront/page'

import { MarkdownRenderer } from '@/components/editor/MarkdownRenderer'
import { SectionContainer } from '@/components/layout/SectionContainer'

import { StoreLayout } from '../_components/layout/Layout'

export default function StoreHowToOrderPage() {
  return (
    <StoreLayout>
      <SectionContainer>
        <MarkdownRenderer content={HOW_TO_ORDER_PAGE} />
      </SectionContainer>
    </StoreLayout>
  )
}
