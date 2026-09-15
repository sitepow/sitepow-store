import { Suspense } from 'react'

import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { MainLayout } from '@/components/layout/Layout'

import { BuyoutCta } from './_components/BuyoutCta'
import { BuyoutFaq } from './_components/BuyoutFaq'
import { BuyoutHeroSection } from './_components/BuyoutHeroSection'
import { BuyoutKeyBenefits } from './_components/BuyoutKeyBenefits'
import { BuyoutPackages } from './_components/BuyoutPackages'
import { BuyoutRoiComparison } from './_components/BuyoutRoiComparison'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('buyout.meta')
  return {
    title: t('title'),
    description: t('description'),
    alternates: {
      canonical: '/pricing/buyout',
      languages: {
        th: '/pricing/buyout?lang=th',
        en: '/pricing/buyout?lang=en',
      },
    },
    openGraph: {
      title: t('title'),
      description: t('description'),
      url: 'https://sitepow.store/pricing/buyout',
      siteName: 'Sitepow Store',
      type: 'website',
    },
  }
}

export default function BuyoutPricingPage() {
  return (
    <MainLayout className="flex flex-col items-center gap-10 overflow-hidden pt-2 pb-10 sm:gap-14 sm:pt-4 sm:pb-12 md:gap-20 lg:gap-24">
      <Suspense>
        <BuyoutHeroSection />
        <BuyoutPackages />
        <BuyoutKeyBenefits />
        <BuyoutRoiComparison />
        <BuyoutFaq />
        <BuyoutCta />
      </Suspense>
    </MainLayout>
  )
}
