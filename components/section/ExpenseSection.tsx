'use client'

import { useTranslations } from 'next-intl'

import { EXPENSE_FEATURES } from '@/constants/expenses'

import { SectionHeader } from '../SectionHeader'
import { FeatureDisplay } from './_components/FeatureDisplay'

export function ExpenseSection() {
  const t = useTranslations('home.expenses')

  const featuresList = EXPENSE_FEATURES.map((item, idx) => ({
    ...item,
    title: t.raw(`items.${idx}.title`) as string,
    description: t.raw(`items.${idx}.description`) as string,
  }))

  return (
    <FeatureDisplay
      isLeft={false}
      imageUrl="/images/landing/landing-expense.jpeg"
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
