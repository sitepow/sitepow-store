import { MainLayout } from '@/components/layout/Layout'
import { ComparisonSection } from '@/components/section/ComparisonSection'
import { FeatureSection } from '@/components/section/FeatureSection'
import { HeroSection } from '@/components/section/HeroSection'
import { InfrastructureSection } from '@/components/section/InfrastructureSection'
import { LogisticsSection } from '@/components/section/LogisticsSection'
import { POSSection } from '@/components/section/POSSection'
import { PaymentSection } from '@/components/section/PaymentSection'
import { PricingPhilosophySection } from '@/components/section/PricingPhilosophySection'
import { ProductTypeSection } from '@/components/section/ProductTypeSection'
import { SecurityTrustSection } from '@/components/section/SecurityTrustSection'
import { StoreCustomizationSection } from '@/components/section/StoreCustomizationSection'
import { StoresSection } from '@/components/section/StoresSection'

export default function HomePage() {
  return (
    <MainLayout className="-mt-12.5">
      <HeroSection />
      <FeatureSection />
      <ProductTypeSection />
      <POSSection />
      <ComparisonSection />
      <PricingPhilosophySection />
      <PaymentSection />
      <LogisticsSection />
      <InfrastructureSection />
      <SecurityTrustSection />
      <StoreCustomizationSection />
      <StoresSection />
    </MainLayout>
  )
}
