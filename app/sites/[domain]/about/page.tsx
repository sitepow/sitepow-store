import { ABOUT_PAGE } from '@/constants/sites/page'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../_components/layout/Layout'

export default function StoreAboutPage() {
  return (
    <StoreLayout>
      <SectionContainer>
        <MarkdownRenderer content={ABOUT_PAGE} />
      </SectionContainer>
    </StoreLayout>
  )
}
