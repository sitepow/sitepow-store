import { MainLayout } from '@/components/layout/Layout'
import { ComparisonSection } from '@/components/section/ComparisonSection'
import { FeatureSection } from '@/components/section/FeatureSection'
import { HeroSection } from '@/components/section/HeroSection'
import { InfrastructureSection } from '@/components/section/InfrastructureSection'
import { LogisticsSection } from '@/components/section/LogisticsSection'
import { PaymentSection } from '@/components/section/PaymentSection'

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <FeatureSection />
      <ComparisonSection />
      <PaymentSection />
      <LogisticsSection />
      <InfrastructureSection />
    </MainLayout>
  )
}
