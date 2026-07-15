import { MerchantPricingTabs } from '@/components/MerchantPricingTabs'
import { MainLayout } from '@/components/layout/Layout'
import { PricingSection } from '@/components/section/PricingSection'

import { PricingPackages } from './_components/PricingPackages'
import { PricingTables } from './_components/PricingTables'

export default function PricingPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-5">
      <PricingSection />
      <MerchantPricingTabs />
      <PricingPackages />
      <PricingTables />
    </MainLayout>
  )
}
