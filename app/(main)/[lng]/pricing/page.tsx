import { MainLayout } from '@/components/layout/Layout'
import { PricingSection } from '@/components/section/PricingSection'

import { PricingPackages } from './_components/PricingPackages'
import { PricingTables } from './_components/PricingTables'
import { PricingTabs } from './_components/PricingTabs'

export default function PricingPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-5">
      <PricingSection />
      <PricingTabs />
      <PricingPackages />
      <PricingTables />
    </MainLayout>
  )
}
