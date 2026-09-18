'use client'

import { useMemo, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import { BUYOUT_BENEFITS_ICONS } from '@/constants/buyout'
import { useIsMounted } from '@/hooks/use-is-mounted'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

export function BuyoutKeyBenefits() {
  const isMounted = useIsMounted()
  const t = useTranslations('buyout.benefits')
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!isMounted || !sectionRef.current) {
        return
      }

      const grid = sectionRef.current.querySelector(
        '[data-animate="benefits-grid"]',
      )
      if (grid) {
        gsap.fromTo(
          grid.children,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.75,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: grid,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef, dependencies: [isMounted] },
  )

  const items = useMemo(() => {
    return BUYOUT_BENEFITS_ICONS.map((icon, idx) => ({
      icon,
      title: t(`items.${idx}.title`),
      description: t(`items.${idx}.description`),
    }))
  }, [t])

  return (
    <section
      ref={sectionRef}
      className="relative mx-auto w-full max-w-7xl space-y-8 px-3.5 sm:space-y-12 sm:px-6 lg:px-8"
    >
      <MainSectionHeader
        as="h2"
        badge={t('badge')}
        title={t('title')}
        description={t('description')}
      />

      <div
        data-animate="benefits-grid"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {items.map((item, idx) => (
          <BenefitCard key={idx} {...item} />
        ))}
      </div>
    </section>
  )
}

interface BenefitCardProps {
  icon: React.ReactNode
  title: string
  description: string
}

function BenefitCard({ icon, title, description }: BenefitCardProps) {
  return (
    <article className="group border-border/80 bg-card/60 hover:border-primary/40 hover:bg-card/90 hover:shadow-primary/5 flex flex-col justify-between rounded-3xl border p-5 shadow-xs backdrop-blur-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-6">
      <div className="space-y-3">
        <div
          className="bg-primary/10 flex size-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110"
          aria-hidden="true"
        >
          {icon}
        </div>
        <h3 className="text-foreground text-base font-bold tracking-tight sm:text-lg">
          {title}
        </h3>
        <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
          {description}
        </p>
      </div>
    </article>
  )
}
