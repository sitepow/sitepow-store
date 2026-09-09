'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import {
  IconCheck,
  IconDeviceDesktop,
  IconPrinter,
  IconScan,
  IconWallet,
} from '@tabler/icons-react'

import { gsap, useGSAP } from '@/lib/gsap'

import { MainSectionHeader } from '../../_components/MainSectionHeader'

const HARDWARE_ICONS = [IconPrinter, IconScan, IconWallet, IconDeviceDesktop]

export function HardwareCompatibilitySection() {
  const t = useTranslations('downloadPos.hardware')
  const sectionRef = useRef<HTMLDivElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
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
    },
    { scope: sectionRef },
  )

  const items = [0, 1, 2, 3].map((idx) => {
    const Icon = HARDWARE_ICONS[idx]
    return {
      icon: <Icon size={24} />,
      title: t(`items.${idx}.title`),
      badge: t(`items.${idx}.badge`),
      description: t(`items.${idx}.description`),
      specs: [0, 1, 2, 3].map((sIdx) => t(`items.${idx}.specs.${sIdx}`)),
    }
  })

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
        className="grid grid-cols-1 gap-3.5 sm:gap-6 md:grid-cols-2"
      >
        {items.map((item, idx) => (
          <div
            key={idx}
            className="border-border/80 bg-card/60 hover:border-border relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-300 hover:shadow-md sm:rounded-3xl sm:p-6"
          >
            <div>
              <div className="flex items-center justify-between gap-3 sm:gap-4">
                <div className="bg-primary/10 text-primary flex size-9 items-center justify-center rounded-xl sm:size-10">
                  {item.icon}
                </div>
                <span className="bg-primary/10 text-primary rounded-full px-2.5 py-0.5 text-[11px] font-semibold sm:text-xs">
                  {item.badge}
                </span>
              </div>
              <div className="pt-2.5 sm:pt-4">
                <h3 className="text-foreground text-base font-bold sm:text-lg">
                  {item.title}
                </h3>
                <p className="text-muted-foreground pt-1.5 text-xs leading-relaxed sm:text-sm">
                  {item.description}
                </p>
              </div>
              <div className="border-border/60 my-3.5 border-t sm:my-5" />
              <ul className="space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
                {item.specs.map((spec, sIdx) => (
                  <li key={sIdx} className="flex items-start gap-2 sm:gap-2.5">
                    <div
                      className="mt-0.5 shrink-0 text-emerald-500"
                      aria-hidden="true"
                    >
                      <IconCheck size={14} strokeWidth={2.5} />
                    </div>
                    <span className="text-foreground/90 leading-snug">
                      {spec}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
