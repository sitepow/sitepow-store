import { MainLayout } from '@/components/layout/Layout'
import { FeatureSection } from '@/components/section/Feature'
import { HeroSection } from '@/components/section/Hero'
import { PaymentSection } from '@/components/section/Payment'

export default function HomePage() {
  return (
    <MainLayout>
      <HeroSection />
      <FeatureSection />
      <PaymentSection />
    </MainLayout>
  )
}
