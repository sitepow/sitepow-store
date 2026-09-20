import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'

import { HeroSection } from '@/components/landing-template/HeroSection'
import { MainLayout } from '@/components/layout/Layout'

import { buildFaqJsonLd } from './_lib/home-content'
import { generateHomeMetadata } from './_lib/home-metadata'

export async function generateMetadata(): Promise<Metadata> {
  return generateHomeMetadata()
}

export default async function HomePage() {
  const [tHero, tFaq] = await Promise.all([
    getTranslations('home.hero'),
    getTranslations('home.faq'),
  ])

  const faqItems = Array.from({ length: 6 }, (_, i) => ({
    q: tFaq(`items.${i}.q`),
    a: tFaq(`items.${i}.a`),
  }))

  return (
    <MainLayout>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(buildFaqJsonLd(faqItems)),
        }}
      />

      <HeroSection
        badge={{ new: tHero('badgeNew'), text: tHero('badgeText', { gp: 0 }) }}
        title={{ start: tHero('titleStart'), gradient: tHero('titleGradient') }}
        description={tHero('description')}
        buttons={{
          register: tHero('registerBtn'),
          manageStore: tHero('manageStoreBtn'),
          downloadPos: tHero('downloadPosBtn'),
        }}
      />
    </MainLayout>
  )
}
