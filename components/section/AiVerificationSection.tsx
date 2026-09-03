'use client'

import { useTranslations } from 'next-intl'

import { AI_VERIFICATION_FEATURES } from '@/constants/aiVerification'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function AiVerificationSection() {
  const t = useTranslations('home.aiVerification')

  const featuresList = AI_VERIFICATION_FEATURES.map((item, idx) => ({
    ...item,
    title: t.raw(`items.${idx}.title`) as string,
    description: t.raw(`items.${idx}.description`) as string,
  }))

  return (
    <FeatureDisplay
      isLeft={true}
      imageUrl="/images/landing/landing-ai-slip.jpeg"
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
