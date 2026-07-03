import { MainLayout } from '@/components/layout/Layout'
import { ComparisonSection } from '@/components/section/ComparisonSection'
import { FeatureSection } from '@/components/section/FeatureSection'
import { HeroSection } from '@/components/section/HeroSection'
import { InfrastructureSection } from '@/components/section/InfrastructureSection'
import { LogisticsSection } from '@/components/section/LogisticsSection'
import { PaymentSection } from '@/components/section/PaymentSection'
import { PricingPhilosophySection } from '@/components/section/PricingPhilosophySection'
import { SecurityTrustSection } from '@/components/section/SecurityTrustSection'
import { StoresSection } from '@/components/section/StoresSection'

export default function HomePage() {
  return (
    <MainLayout className="-mt-12.5">
      <HeroSection />
      <FeatureSection />
      <ComparisonSection />
      <PricingPhilosophySection />
      <PaymentSection />
      <LogisticsSection />
      <InfrastructureSection />
      <SecurityTrustSection />
      <StoresSection />
    </MainLayout>
  )
}
