'use client'

import { useTranslations } from 'next-intl'

import { INFRASTRUCTURE_FEATURES } from '@/constants/infrastructure'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function InfrastructureSection() {
  const t = useTranslations('home.infrastructure')

  const featuresList = INFRASTRUCTURE_FEATURES.map((item, idx) => ({
    ...item,
    title: t.raw(`items.${idx}.title`) as string,
    description: t.raw(`items.${idx}.description`) as string,
  }))

  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-cloud.jpeg"
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
