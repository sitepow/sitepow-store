'use client'

import { useTranslations } from 'next-intl'

import { PERMISSION_FEATURES } from '@/constants/permissions'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function PermissionSection() {
  const t = useTranslations('home.permissions')

  const featuresList = PERMISSION_FEATURES.map((item, idx) => ({
    ...item,
    title: t.raw(`items.${idx}.title`) as string,
    description: t.raw(`items.${idx}.description`) as string,
  }))

  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-permission.jpeg"
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
