'use client'

import { useTranslations } from 'next-intl'

import { PRODUCT_TYPE_FEATURES } from '@/constants/product-types'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function ProductTypeSection() {
  const t = useTranslations('home.productTypes')

  const featuresList = PRODUCT_TYPE_FEATURES.map((item, idx) => ({
    ...item,
    title: t.raw(`items.${idx}.title`) as string,
    description: t.raw(`items.${idx}.description`) as string,
  }))

  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-product-type.jpeg"
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
