'use client'

import { useTranslations } from 'next-intl'

import { CUSTOMER_LOYALTY_FEATURES } from '@/constants/customerLoyalty'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function CustomerLoyaltySection() {
  const t = useTranslations('home.customerLoyalty')

  const featuresList = CUSTOMER_LOYALTY_FEATURES.map((item, idx) => ({
    ...item,
    title: t.raw(`items.${idx}.title`) as string,
    description: t.raw(`items.${idx}.description`) as string,
  }))

  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-loyalty.jpeg"
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
