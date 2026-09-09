'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { FeatureWorkflowStep } from '@/constants/features'
import { useIsMounted } from '@/hooks/use-is-mounted'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

import { MainSectionHeader } from '../../../_components/MainSectionHeader'

export function FeatureWorkflowSection({
  workflow,
}: {
  workflow: FeatureWorkflowStep[]
}) {
  const isMounted = useIsMounted()
  const t = useTranslations('features.detail.workflow')
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (!isMounted) return

      if (headerRef.current) {
        gsap.fromTo(
          headerRef.current,
          { y: 35, opacity: 0 },
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

      if (cardsRef.current) {
        const cards = Array.from(cardsRef.current.children)
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { y: 45, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.85,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            },
          )
        })
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef, dependencies: [isMounted, workflow] },
  )

  return (
    <div
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8"
    >
      <div ref={headerRef}>
        <MainSectionHeader
          badge={t('badge')}
          title={t('title')}
          description={t('description')}
        />
      </div>
      <div
        ref={cardsRef}
        className="grid grid-cols-1 gap-3.5 sm:gap-6 md:grid-cols-3"
      >
        {workflow.map((item, wIdx) => (
          <div
            key={wIdx}
            className="bg-card/60 border-border/80 hover:border-border relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-300 hover:shadow-md sm:rounded-3xl sm:p-6"
          >
            <div className="space-y-2.5 sm:space-y-4">
              <div className="text-primary text-2xl font-black sm:text-3xl">
                {item.step}
              </div>
              <h3 className="text-foreground text-base font-bold sm:text-lg">
                {item.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
