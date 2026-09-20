'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'

import { COMMON_FEATURES, PRICING_PLANS } from '@/constants/pricing'

import { MainSectionHeader } from '../../_components/MainSectionHeader'
import { PricingCard } from './PricingCard'

export function PricingPackages() {
  const t = useTranslations('pricing')

  const translatedPlans = useMemo(() => {
    return PRICING_PLANS.map((plan, idx) => {
      const getRawText = (path: string, fallback: string) => {
        try {
          return (t.raw(path) as string) || fallback
        } catch {
          return fallback
        }
      }

      return {
        ...plan,
        title: getRawText(`plans.${idx}.title`, plan.title),
        description: getRawText(`plans.${idx}.description`, plan.description),
        buttonText: getRawText(`plans.${idx}.buttonText`, plan.buttonText),
        uniqueFeatures: plan.uniqueFeatures.map((feature, fIdx) => ({
          ...feature,
          text: getRawText(`plans.${idx}.features.${fIdx}`, feature.text),
        })),
      }
    })
  }, [t])

  const translatedCommonFeatures = useMemo(() => {
    return COMMON_FEATURES.map((feature, index) => {
      let text = feature.text
      try {
        text =
          (t.raw(`commonFeatures.items.${index}`) as string) || feature.text
      } catch {}
      return { ...feature, text }
    })
  }, [t])

  return (
    <section className="relative mx-auto w-full max-w-7xl space-y-12 px-3.5 sm:space-y-16 sm:px-6 lg:space-y-20 lg:px-8">
      <div
        aria-hidden="true"
        className="from-primary/15 pointer-events-none absolute top-24 left-1/2 -z-10 h-80 w-full max-w-4xl -translate-x-1/2 rounded-full bg-linear-to-r via-orange-500/10 to-transparent blur-3xl"
      />

      <div className="grid w-full items-stretch gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {translatedPlans.map((plan, index) => (
          <PricingCard key={`${plan.title}-${index}`} {...plan} />
        ))}
      </div>

      <div className="space-y-6 sm:space-y-10">
        <MainSectionHeader
          as="h3"
          title={
            (t.raw('commonFeatures.title') as string) ||
            'ฟีเจอร์ที่ทุกแพ็กเกจได้รับเหมือนกัน'
          }
        />

        <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
          {translatedCommonFeatures.map((feature, index) => (
            <div
              key={index}
              className="group border-border/70 bg-card/60 hover:border-primary/40 hover:bg-card/90 hover:shadow-primary/5 flex items-start gap-3 rounded-2xl border p-3.5 shadow-2xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md sm:p-4.5"
            >
              <div
                className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 sm:size-9"
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
    </section>
  )
}
