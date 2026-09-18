'use client'

import { useMemo, useRef } from 'react'

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

  useGSAP(
    () => {
      if (!isMounted || !sectionRef.current) {
        return
      }

      const plansGrid = sectionRef.current.querySelector(
        '[data-animate="plans-grid"]',
      )
      const commonGrid = sectionRef.current.querySelector(
        '[data-animate="common-grid"]',
      )

      if (plansGrid) {
        gsap.fromTo(
          plansGrid.children,
          { y: 50, scale: 0.95, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.85,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: plansGrid,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      if (commonGrid) {
        gsap.fromTo(
          commonGrid.children,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            stagger: 0.05,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: commonGrid,
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
    <section
      ref={sectionRef}
      className="relative mx-auto w-full max-w-7xl space-y-12 px-3.5 sm:space-y-16 sm:px-6 lg:space-y-20 lg:px-8"
    >
      <div
        aria-hidden="true"
        className="from-primary/15 pointer-events-none absolute top-24 left-1/2 -z-10 h-80 w-full max-w-4xl -translate-x-1/2 rounded-full bg-linear-to-r via-orange-500/10 to-transparent blur-3xl"
      />

      <div
        data-animate="plans-grid"
        className="grid w-full items-stretch gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
      >
        {translatedPlans.map((plan, index) => (
          <PricingCard key={`${plan.title}-${index}`} {...plan} />
        ))}
      </div>

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
          data-animate="common-grid"
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
    </section>
  )
}
