'use client'

import { useRef, useState } from 'react'

import { useTranslations } from 'next-intl'

import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import { useGSAP } from '@gsap/react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { Safari } from '@/components/magicui/safari'

import { gsap } from '@/lib/gsap'

export interface HowItWorksSectionProps {
  badge?: string
  title?: string
  description?: string
  steps?: Array<{ title: string; description: string; badge?: string }>
}

export function HowItWorksSection({
  badge,
  title,
  description,
  steps: propSteps,
}: HowItWorksSectionProps = {}) {
  const [activeStep, setActiveStep] = useState(0)
  const t = useTranslations('home.howItWorks')

  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const stepsRef = useRef<HTMLDivElement>(null)
  const mockupRef = useRef<HTMLDivElement>(null)

  const resolvedBadge = badge ?? t('badge')
  const resolvedTitle = title ?? t('title')
  const resolvedDescription = description ?? t('description')

  useGSAP(
    () => {
      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: headerRef.current,
              start: 'top 90%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      if (stepsRef.current) {
        const stepItems = Array.from(stepsRef.current.children)
        stepItems.forEach((step) => {
          gsap.fromTo(
            step,
            { x: -40, opacity: 0 },
            {
              x: 0,
              opacity: 1,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: step,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            },
          )
        })
      }

      if (mockupRef.current) {
        gsap.fromTo(
          mockupRef.current,
          { scale: 0.93, y: 50, opacity: 0 },
          {
            scale: 1,
            y: 0,
            opacity: 1,
            duration: 0.9,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: mockupRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        )
      }
    },
    { scope: sectionRef },
  )

  const defaultStepConfigs = [
    {
      step: '01',
      url: 'sitepow.store/register',
      videoSrc: '/login-section.webm',
    },
    {
      step: '02',
      url: 'sitepow.store/merchant/products',
      videoSrc: '/product-section.webm',
    },
    {
      step: '03',
      url: 'sitepow.store/merchant/pos',
      videoSrc: '/storefront-section.webm',
    },
  ]

  const steps = defaultStepConfigs.map((cfg, idx) => ({
    ...cfg,
    title: propSteps?.[idx]?.title ?? t(`steps.${idx}.title`),
    description: propSteps?.[idx]?.description ?? t(`steps.${idx}.description`),
    badge: propSteps?.[idx]?.badge ?? t(`steps.${idx}.badge`),
  }))

  const currentStep = steps[activeStep]

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      className="relative w-full py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div ref={headerRef}>
          <MainSectionHeader
            badge={resolvedBadge}
            title={resolvedTitle}
            description={resolvedDescription}
          />
        </div>
        <div className="grid grid-cols-1 items-center gap-6 lg:grid-cols-12 lg:gap-8">
          <div ref={stepsRef} className="space-y-4 lg:col-span-5">
            {steps.map((s, idx) => (
              <div
                key={idx}
                onClick={() => setActiveStep(idx)}
                className={`group cursor-pointer rounded-2xl border p-4 transition-all duration-300 sm:p-5 ${
                  activeStep === idx
                    ? 'border-primary/40 bg-primary/4 dark:bg-primary/8 shadow-md'
                    : 'border-border/60 bg-card hover:border-border'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        activeStep === idx
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {s.step}
                    </span>
                    <span className="text-card-foreground text-sm font-bold sm:text-base">
                      {s.title}
                    </span>
                  </div>
                  <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-[10px] font-medium">
                    {s.badge}
                  </span>
                </div>
                <p className="text-muted-foreground mt-3 pl-0 text-xs leading-relaxed sm:pl-11 sm:text-sm">
                  {s.description}
                </p>
              </div>
            ))}
          </div>

          <div ref={mockupRef} className="lg:col-span-7">
            <div className="bg-card ring-border relative overflow-hidden rounded-3xl border p-2 shadow-2xl ring-1">
              <Safari
                url={currentStep.url}
                videoSrc={currentStep.videoSrc}
                className="w-full"
              >
                <div className="size-full bg-neutral-200 transition-colors dark:bg-neutral-800" />
              </Safari>
              <BorderBeam
                size={160}
                duration={8}
                colorFrom="#f97316"
                colorTo="#3b82f6"
                borderWidth={1.5}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
