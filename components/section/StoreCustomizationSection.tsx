'use client'

import { useTranslations } from 'next-intl'

import { CUSTOMIZATION_FEATURES } from '@/constants/store-customization'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function StoreCustomizationSection() {
  const t = useTranslations('home.storeCustomization')

  const featuresList = CUSTOMIZATION_FEATURES.map((item, idx) => ({
    ...item,
    title: t.raw(`items.${idx}.title`) as string,
    description: t.raw(`items.${idx}.description`) as string,
  }))

  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-customization.jpeg"
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
