import { MainLayout } from '@/components/layout/Layout'
import { ComparisonSection } from '@/components/section/Comparison'
import { FeatureSection } from '@/components/section/Feature'
import { HeroSection } from '@/components/section/Hero'
import { LogisticsSection } from '@/components/section/Logistics'
import { PaymentSection } from '@/components/section/Payment'

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <FeatureSection />
      <ComparisonSection />
      <PaymentSection />
      <LogisticsSection />
    </MainLayout>
  )
}
