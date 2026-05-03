import { MainLayout } from '@/components/layout/Layout'
import { FeatureSection } from '@/components/section/Feature'
import { HeroSection } from '@/components/section/Hero'
import { LogisticsSection } from '@/components/section/Logistics'
import { PaymentSection } from '@/components/section/Payment'
import { ProfitComparisonSection } from '@/components/section/ProfitComparison'

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <FeatureSection />
      <ProfitComparisonSection />
      <PaymentSection />
      <LogisticsSection />
    </MainLayout>
  )
}
