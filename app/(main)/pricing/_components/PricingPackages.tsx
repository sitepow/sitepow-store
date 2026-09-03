'use client'

import { useTranslations } from 'next-intl'

import { COMMON_FEATURES, PRICING_PLANS } from '@/constants/pricing'

import { SectionContainer } from '@/components/SectionContainer'
import { SectionHeader } from '@/components/SectionHeader'
import { Card, CardContent } from '@/components/ui/card'

import { PricingCard } from './PricingCard'

export function PricingPackages() {
  const t = useTranslations('pricing')

  const translatedPlans = PRICING_PLANS.map((plan, idx) => ({
    ...plan,
    title: (t.raw(`plans.${idx}.title`) as string) || plan.title,
    description:
      (t.raw(`plans.${idx}.description`) as string) || plan.description,
    buttonText: (t.raw(`plans.${idx}.buttonText`) as string) || plan.buttonText,
    uniqueFeatures: plan.uniqueFeatures.map((feature, fIdx) => ({
      ...feature,
      text: (t.raw(`plans.${idx}.features.${fIdx}`) as string) || feature.text,
    })),
  }))

  const translatedCommonFeatures = COMMON_FEATURES.map((feature, index) => ({
    ...feature,
    text: (t.raw(`commonFeatures.items.${index}`) as string) || feature.text,
  }))

  return (
    <>
      <SectionContainer>
        <div className="grid w-full gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {translatedPlans.map((plan) => (
            <PricingCard key={plan.title} {...plan} />
          ))}
        </div>
      </SectionContainer>
      <SectionContainer>
        <SectionHeader title={t.raw('commonFeatures.title') as string} />
        <Card className="mt-5 w-full">
          <CardContent>
            <div className="grid w-full grid-cols-1 gap-4 text-start sm:grid-cols-2 lg:grid-cols-3">
              {translatedCommonFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="text-primary shrink-0" aria-hidden="true">
                    {feature.icon}
                  </div>
                  <span>{feature.text}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </SectionContainer>
    </>
  )
}
