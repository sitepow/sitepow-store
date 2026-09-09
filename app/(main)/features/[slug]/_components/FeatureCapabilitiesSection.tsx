'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { FeatureCapability } from '@/constants/features'
import { useIsMounted } from '@/hooks/use-is-mounted'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

import { MainSectionHeader } from '../../../_components/MainSectionHeader'

export function FeatureCapabilitiesSection({
  capabilities,
}: {
  capabilities: FeatureCapability[]
}) {
  const isMounted = useIsMounted()
  const t = useTranslations('features.detail.capabilities')
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
    { scope: sectionRef, dependencies: [isMounted, capabilities] },
  )

  return (
    <div
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8"
    >
      <div ref={headerRef}>
        <MainSectionHeader badge={t('badge')} title={t('title')} />
      </div>
      <div
        ref={cardsRef}
        className="grid grid-cols-1 gap-3.5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {capabilities.map((cap, cIdx) => (
          <div
            key={cIdx}
            className="border-border/80 bg-card/60 hover:border-border relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-300 hover:shadow-md sm:rounded-3xl sm:p-6"
          >
            <div className="space-y-2 sm:space-y-3">
              {cap.badge && (
                <span className="bg-primary/10 text-primary inline-block rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                  {cap.badge}
                </span>
              )}
              <h3 className="text-foreground text-base font-bold sm:text-lg">
                {cap.title}
              </h3>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                {cap.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
