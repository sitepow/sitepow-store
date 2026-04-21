import { HOW_TO_ORDER_PAGE } from '@/constants/sites/page'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../_components/layout/Layout'

export default function StoreDescriptionPage() {
  return (
    <StoreLayout>
      <SectionContainer>
        <MarkdownRenderer content={HOW_TO_ORDER_PAGE} />
      </SectionContainer>
    </StoreLayout>
  )
}
