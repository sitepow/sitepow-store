import { SectionContainer } from '@/components/SectionContainer'

import { StoreLayout } from '../../_components/layout/Layout'
import { BuyerAccountTabs } from '../_components/BuyerAccountTabs'

export default function StoreAccountOrderPage() {
  return (
    <StoreLayout>
      <SectionContainer>
        <BuyerAccountTabs />
      </SectionContainer>
    </StoreLayout>
  )
}
