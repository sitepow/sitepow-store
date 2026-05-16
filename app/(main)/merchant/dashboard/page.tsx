import { SectionContainer } from '@/components/SectionContainer'
import { MainLayout } from '@/components/layout/Layout'

import { MerchantAccountTabs } from '../_components/MerchantAccountTabs'

export default function AccountDashboardPage() {
  return (
    <MainLayout>
      <SectionContainer>
        <MerchantAccountTabs />
      </SectionContainer>
    </MainLayout>
  )
}
