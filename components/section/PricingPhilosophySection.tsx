'use client'

import { useTranslations } from 'next-intl'

import { PHILOSOPHY_FEATURES } from '@/constants/pricing-philosophy'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function PricingPhilosophySection() {
  const t = useTranslations('home.pricingPhilosophy')

  const featuresList = PHILOSOPHY_FEATURES.map((item, idx) => ({
    ...item,
    title: t.raw(`items.${idx}.title`) as string,
    description: t.raw(`items.${idx}.description`) as string,
  }))

  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-pricing.jpeg"
      sectionHeader={
        <SectionHeader
          className="max-w-lg text-white"
          title={t.raw('title') as string}
          description={t.raw('description') as string}
        />
      }
      featuresList={featuresList}
    />
  )
}
