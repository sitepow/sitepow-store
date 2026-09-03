'use client'

import { useTranslations } from 'next-intl'

import { RESELLER_FEATURES } from '@/constants/reseller'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function ResellerSection() {
  const t = useTranslations('home.reseller')

  const featuresList = RESELLER_FEATURES.map((item, idx) => ({
    ...item,
    title: t.raw(`items.${idx}.title`) as string,
    description: t.raw(`items.${idx}.description`) as string,
  }))

  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-reseller.jpeg"
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
