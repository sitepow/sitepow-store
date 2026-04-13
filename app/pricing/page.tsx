import { SectionContainer } from '@/components/SectionContainer'
import { MainLayout } from '@/components/layout/Layout'
import { PricingSection } from '@/components/section/Pricing'

import { PricingPackages } from './_components/PricingPackages'
import { PricingTabs } from './_components/PricingTabs'

export default function PricingPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-5">
      <PricingSection />
      <PricingTabs />
      <SectionContainer>
        <PricingPackages />
      </SectionContainer>
    </MainLayout>
  )
}
