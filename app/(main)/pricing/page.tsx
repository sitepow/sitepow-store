import { Suspense } from 'react'

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { CtaSection } from '@/components/landing-template/CtaSection'
import { FaqSection } from '@/components/landing-template/FaqSection'
import { MainLayout } from '@/components/layout/Layout'

import { PricingHeroSection } from './_components/PricingHeroSection'
import { PricingPackages } from './_components/PricingPackages'
import { PricingTables } from './_components/PricingTables'
import { ProfitComparisonSection } from './_components/ProfitComparisonSection'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('pricing.meta')
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/pricing',
      languages: {
        th: '/pricing?lang=th',
        en: '/pricing?lang=en',
      },
    },
  }
}

export default function PricingPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-8 overflow-hidden pt-2 pb-10 sm:gap-12 sm:pt-4 sm:pb-12 md:gap-20 lg:gap-24">
      <Suspense>
        <PricingHeroSection />
        <PricingPackages />
        <ProfitComparisonSection />
        <PricingTables />
        <FaqSection />
        <CtaSection />
      </Suspense>
    </MainLayout>
  )
}
