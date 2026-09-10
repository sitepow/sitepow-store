'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { COMMON_FEATURES, PRICING_PLANS } from '@/constants/pricing'
import { useIsMounted } from '@/hooks/use-is-mounted'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

import { MainSectionHeader } from '../../_components/MainSectionHeader'
import { PricingCard } from './PricingCard'

export function PricingPackages() {
  const isMounted = useIsMounted()
  const t = useTranslations('pricing')
  const sectionRef = useRef<HTMLDivElement>(null)
  const plansRef = useRef<HTMLDivElement>(null)
  const commonRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (plansRef.current) {
        const cards = Array.from(plansRef.current.children)
        gsap.fromTo(
          cards,
          { y: 50, scale: 0.95, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.85,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: plansRef.current,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      if (commonRef.current) {
        const tiles = Array.from(commonRef.current.children)
        gsap.fromTo(
          tiles,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.05,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: commonRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef, dependencies: [isMounted] },
  )

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
    <div
      ref={sectionRef}
      className="relative mx-auto w-full max-w-7xl space-y-12 px-3.5 sm:space-y-16 sm:px-6 lg:space-y-20 lg:px-8"
    >
      {/* Background Soft Glow */}
      <div
        aria-hidden="true"
        className="from-primary/15 pointer-events-none absolute top-24 left-1/2 -z-10 h-80 w-full max-w-4xl -translate-x-1/2 rounded-full bg-gradient-to-r via-orange-500/10 to-transparent blur-3xl"
      />

      {/* Main Pricing Cards Grid */}
      <div
        ref={plansRef}
        className="grid w-full items-stretch gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {translatedPlans.map((plan) => (
          <PricingCard key={plan.title} {...plan} />
        ))}
      </div>

      {/* Common Features Section */}
      <div className="space-y-6 sm:space-y-10">
        <MainSectionHeader
          as="h3"
          badge={t('commonFeatures.badge')}
          title={
            (t.raw('commonFeatures.title') as string) ||
            'ฟีเจอร์ที่ทุกแพ็กเกจได้รับเหมือนกัน'
          }
          description={t('commonFeatures.description')}
        />

        <div
          ref={commonRef}
          className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3"
        >
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
    </div>
  )
}
