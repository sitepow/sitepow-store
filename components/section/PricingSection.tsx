'use client'

import { useTranslations } from 'next-intl'

import { HeroHeader } from '../HeroHeader'
import { SectionContainer } from '../SectionContainer'

export function PricingSection() {
  const t = useTranslations('pricing.hero')

  return (
    <SectionContainer>
      <HeroHeader title={t.raw('title') as string} />
    </SectionContainer>
  )
}
