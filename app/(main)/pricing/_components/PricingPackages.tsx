'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { COMMON_FEATURES, PRICING_PLANS } from '@/constants/pricing'

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
    } catch {
      // fallback
    }

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
    } catch {
      // fallback
    }
    return {
      ...feature,
      text,
    }
  })

  return (
    <div className="mx-auto w-full max-w-7xl space-y-20 px-4 sm:px-6 lg:px-8">
      {/* 4 Pricing Cards */}
      <div className="grid w-full gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {translatedPlans.map((plan) => (
          <PricingCard key={plan.title} {...plan} />
        ))}
      </div>

      {/* Common Features Section */}
      <div className="space-y-8">
        <div className="mx-auto max-w-3xl space-y-3 text-center">
          <span className="text-primary text-xs font-semibold">
            ฟังก์ชันมาตรฐานที่มีในทุกแพ็กเกจ
          </span>
          <h3 className="text-foreground text-2xl font-bold tracking-tight sm:text-3xl">
            {(t.raw('commonFeatures.title') as string) ||
              'ฟีเจอร์ที่ทุกแพ็กเกจได้รับเหมือนกัน'}
          </h3>
          <p className="text-muted-foreground text-sm sm:text-base">
            ไม่ว่าคุณจะเริ่มต้นด้วยแพ็กเกจใด
            คุณจะได้รับระบบโครงสร้างพื้นฐานและการจัดการร้านค้าครบวงจรทันที
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {translatedCommonFeatures.map((feature, index) => (
            <div
              key={index}
              className="bg-card/60 hover:bg-card border-border/70 hover:border-border flex items-start gap-3 rounded-2xl border p-4 shadow-2xs transition-all duration-200"
            >
              <div
                className="bg-primary/10 text-primary mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-xl"
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
