import { FAQ_PAGE } from '@/constants/storefront/page'

import { MarkdownRenderer } from '@/components/editor/MarkdownRenderer'
import { SectionContainer } from '@/components/layout/SectionContainer'

import { StoreLayout } from '../_components/layout/Layout'

export default function StoreFaqsPage() {
  return (
    <StoreLayout>
      <SectionContainer>
        <MarkdownRenderer content={FAQ_PAGE} />
      </SectionContainer>
    </StoreLayout>
  )
}
