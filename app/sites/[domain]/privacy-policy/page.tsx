import { PRIVATE_POLICY_PAGE } from '@/constants/storefront/page'

import { MarkdownRenderer } from '@/components/editor/MarkdownRenderer'
import { SectionContainer } from '@/components/layout/SectionContainer'

import { StoreLayout } from '../_components/layout/Layout'

export default function StorePrivacyPolicyPage() {
  return (
    <StoreLayout>
      <SectionContainer>
        <MarkdownRenderer content={PRIVATE_POLICY_PAGE} />
      </SectionContainer>
    </StoreLayout>
  )
}
