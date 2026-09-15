'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { MainFaqAccordion } from '@/app/(main)/_components/MainFaqAccordion'
import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import { useGSAP } from '@gsap/react'

import { gsap } from '@/lib/gsap'

export function BuyoutFaq() {
  const t = useTranslations('buyout.faq')
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      if (contentRef.current) {
        const elements = Array.from(contentRef.current.children)
        elements.forEach((el) => {
          gsap.fromTo(
            el,
            { y: 35, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: el,
                start: 'top 90%',
                toggleActions: 'play none none none',
              },
            },
          )
        })
      }
    },
    { scope: sectionRef },
  )

  const items = [0, 1, 2, 3, 4].map((idx) => ({
    q: t(`items.${idx}.q`),
    a: t(`items.${idx}.a`),
  }))

  return (
    <section
      ref={sectionRef}
      id="buyout-faq"
      className="border-border/40 relative w-full border-t py-10 sm:py-16 md:py-24"
    >
      <div
        ref={contentRef}
        className="mx-auto w-full max-w-4xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8"
      >
        <MainSectionHeader
          badge={t('badge')}
          title={t('title')}
          description={t('description')}
        />
        <MainFaqAccordion items={items} idPrefix="buyout-faq" />
      </div>
    </section>
  )
}
