import { FAQ_PAGE } from '@/constants/storefront/page'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { SectionContainer } from '@/components/SectionContainer'

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
