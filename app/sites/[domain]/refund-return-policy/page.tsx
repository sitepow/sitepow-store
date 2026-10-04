import { REFUND_POLICY_PAGE } from '@/constants/storefront/page'

import { MarkdownRenderer } from '@/components/editor/MarkdownRenderer'
import { SectionContainer } from '@/components/layout/SectionContainer'

import { StoreLayout } from '../_components/layout/Layout'

export default function StoreRefundReturnPolicyPage() {
  return (
    <StoreLayout>
      <SectionContainer>
        <MarkdownRenderer content={REFUND_POLICY_PAGE} />
      </SectionContainer>
    </StoreLayout>
  )
}
