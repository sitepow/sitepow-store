'use client'

import { useTranslations } from 'next-intl'

import { NAVBAR_ITEMS } from '@/constants/navbar'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function FeatureSection() {
  const t = useTranslations('home.features')
  const defaultItems =
    NAVBAR_ITEMS.find((item) => item.href === '/features')?.children || []

  const featuresList = defaultItems.map((item, idx) => ({
    ...item,
    title: t.raw(`items.${idx}.title`) as string,
    description: t.raw(`items.${idx}.description`) as string,
  }))

  return (
    <FeatureDisplay
      imageUrl="/images/landing/landing-orders-managers.jpeg"
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
