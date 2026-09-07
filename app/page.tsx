import { Suspense } from 'react'

import { BlogsSection } from '@/components/landing-template/BlogsSection'
import { CtaSection } from '@/components/landing-template/CtaSection'
import { FaqSection } from '@/components/landing-template/FaqSection'
import { FeaturesBentoSection } from '@/components/landing-template/FeaturesBentoSection'
import { HeroSection } from '@/components/landing-template/HeroSection'
import { HowItWorksSection } from '@/components/landing-template/HowItWorksSection'
import { LogosSection } from '@/components/landing-template/LogosSection'
import { PricingSection } from '@/components/landing-template/PricingSection'
import { ProblemSection } from '@/components/landing-template/ProblemSection'
import { SolutionSection } from '@/components/landing-template/SolutionSection'
import { MainLayout } from '@/components/layout/Layout'

export default function HomePage() {
  return (
    <MainLayout className="-mt-12.5">
      <Suspense>
        <HeroSection />
      </Suspense>
      <LogosSection />
      <ProblemSection />
      <SolutionSection />
      <HowItWorksSection />
      <FeaturesBentoSection />
      <PricingSection />
      <BlogsSection />
      <FaqSection />
      <CtaSection />
    </MainLayout>
  )
}
