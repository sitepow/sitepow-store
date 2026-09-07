'use client'
import { useTranslations } from 'next-intl'

import { COMMON_FEATURES, PRICING_PLANS } from '@/constants/pricing'

import { MainSectionHeader } from '../../_components/MainSectionHeader'
import { PricingCard } from './PricingCard'

export function PricingPackages() {
  const t = useTranslations('pricing')
  const translatedPlans = PRICING_PLANS.map((plan, idx) => {
    let title = plan.title
    let description = plan.description
    let buttonText = plan.buttonText
    let uniqueFeatures = plan.uniqueFeatures
    try {
      title = (t.raw(`plans.${idx}.title`) as string) || plan.title
      description =
        (t.raw(`plans.${idx}.description`) as string) || plan.description
      buttonText =
        (t.raw(`plans.${idx}.buttonText`) as string) || plan.buttonText
      uniqueFeatures = plan.uniqueFeatures.map((feature, fIdx) => ({
        ...feature,
        text:
          (t.raw(`plans.${idx}.features.${fIdx}`) as string) || feature.text,
      }))
    } catch {}
    return {
      ...plan,
      title,
      description,
      buttonText,
      uniqueFeatures,
    }
  })
  const translatedCommonFeatures = COMMON_FEATURES.map((feature, index) => {
    let text = feature.text
    try {
      text = (t.raw(`commonFeatures.items.${index}`) as string) || feature.text
    } catch {}
    return {
      ...feature,
      text,
    }
  })
  return (
    <div className="mx-auto w-full max-w-7xl space-y-8 px-3.5 sm:space-y-12 sm:px-6 lg:space-y-16 lg:px-8">
      <div className="grid w-full gap-3.5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {translatedPlans.map((plan) => (
          <PricingCard key={plan.title} {...plan} />
        ))}
      </div>
      <div className="space-y-4 sm:space-y-8">
        <MainSectionHeader
          as="h3"
          badge={t('commonFeatures.badge')}
          title={
            (t.raw('commonFeatures.title') as string) ||
            'ฟีเจอร์ที่ทุกแพ็กเกจได้รับเหมือนกัน'
          }
          description={t('commonFeatures.description')}
        />
        <div className="grid w-full grid-cols-1 gap-2.5 sm:grid-cols-2 sm:gap-3.5 lg:grid-cols-3">
          {translatedCommonFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-card/60 hover:bg-card border-border/70 hover:border-border flex items-start gap-2.5 rounded-xl border p-3 shadow-2xs transition-all duration-200 sm:gap-3 sm:rounded-2xl sm:p-4"
            >
              <div
                className="bg-primary/10 text-primary mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg sm:size-8 sm:rounded-xl"
                aria-hidden="true"
              >
                {feature.icon}
              </div>
              <span className="text-foreground text-xs leading-relaxed font-medium sm:text-sm">
                {feature.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
