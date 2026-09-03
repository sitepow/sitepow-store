'use client'

import { useTranslations } from 'next-intl'

import { LOGISTICS_FEATURES } from '@/constants/logistics'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function LogisticsSection() {
  const t = useTranslations('home.logistics')

  const featuresList = LOGISTICS_FEATURES.map((item, idx) => ({
    ...item,
    title: t.raw(`items.${idx}.title`) as string,
    description: t.raw(`items.${idx}.description`) as string,
  }))

  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-product-boxs.jpeg"
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
