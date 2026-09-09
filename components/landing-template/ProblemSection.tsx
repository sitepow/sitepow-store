'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import { useGSAP } from '@gsap/react'
import { IconCoins, IconReceipt2, IconRefreshAlert } from '@tabler/icons-react'

import { gsap } from '@/lib/gsap'

const PROBLEM_ICONS = [IconCoins, IconReceipt2, IconRefreshAlert]

export function ProblemSection() {
  const t = useTranslations('home.problem')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

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

      if (cardsRef.current) {
        const cards = Array.from(cardsRef.current.children)
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { y: 50, opacity: 0 },
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
    },
    { scope: sectionRef },
  )

  const items = [0, 1, 2].map((idx) => ({
    icon: PROBLEM_ICONS[idx],
    title: t(`items.${idx}.title`),
    description: t(`items.${idx}.description`),
  }))
  return (
    <section
      ref={sectionRef}
      id="problem"
      className="relative w-full py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div ref={headerRef}>
          <MainSectionHeader
            badge={t('badge')}
            title={t('title')}
            description={t('description')}
          />
        </div>
        <div ref={cardsRef} className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((prob, idx) => (
            <div
              key={idx}
              className="border-border/80 bg-card/60 hover:border-border hover:bg-card relative flex flex-col justify-between rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-6"
            >
              <div>
                <div className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-xl">
                  <prob.icon size={22} />
                </div>
                <h3 className="text-foreground text-lg font-bold">
                  {prob.title}
                </h3>
                <p className="text-muted-foreground pt-2 text-xs leading-relaxed sm:text-sm">
                  {prob.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
