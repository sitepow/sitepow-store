'use client'

import { useMemo, useRef } from 'react'

import { useTranslations } from 'next-intl'

import { MainFaqAccordion } from '@/app/(main)/_components/MainFaqAccordion'
import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'

import { gsap, useGSAP } from '@/lib/gsap'

export function BuyoutFaq() {
  const t = useTranslations('buyout.faq')
  const sectionRef = useRef<HTMLElement>(null)

  useGSAP(
    () => {
      if (!sectionRef.current) {
        return
      }

      const elements = sectionRef.current.querySelectorAll(
        '[data-animate="faq-item"]',
      )

      if (elements.length > 0) {
        gsap.fromTo(
          elements,
          { y: 35, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: sectionRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        )
      }
    },
    { scope: sectionRef },
  )

  const items = useMemo(() => {
    try {
      const rawItems = t.raw('items') as Array<{ q: string; a: string }>
      if (Array.isArray(rawItems)) return rawItems
    } catch {}

    return [0, 1, 2, 3, 4].map((idx) => ({
      q: t(`items.${idx}.q`),
      a: t(`items.${idx}.a`),
    }))
  }, [t])

  return (
    <section
      ref={sectionRef}
      id="buyout-faq"
      className="border-border/40 relative w-full border-t py-10 sm:py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-4xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8">
        <div data-animate="faq-item">
          <MainSectionHeader
            badge={t('badge')}
            title={t('title')}
            description={t('description')}
          />
        </div>

        <div data-animate="faq-item">
          <MainFaqAccordion items={items} idPrefix="buyout-faq" />
        </div>
      </div>
    </section>
  )
}
