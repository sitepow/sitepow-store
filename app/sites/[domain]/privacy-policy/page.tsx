import { PRIVATE_POLICY_PAGE } from '@/constants/sites/page'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { SectionContainer } from '@/components/SectionContainer'

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
