import { REFUND_POLICY_PAGE } from '@/constants/sites/page'

import { MarkdownRenderer } from '@/components/MarkdownRenderer'
import { SectionContainer } from '@/components/SectionContainer'

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
