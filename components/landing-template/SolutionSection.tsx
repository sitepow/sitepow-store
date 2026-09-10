'use client'
import React, { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import { useGSAP } from '@gsap/react'
import { IconCpu, IconFlame, IconQrcode } from '@tabler/icons-react'

import { Safari } from '@/components/magicui/safari'

import { ScrollTrigger, gsap } from '@/lib/gsap'

const SOLUTION_CONFIGS = [
  {
    icon: <IconQrcode size={20} className="sm:size-5" />,
    url: 'pos.sitepow.store',
    videoSrc: '/pos-section.webm',
    accent: 'from-blue-500/15 text-blue-500',
  },
  {
    icon: <IconCpu size={20} className="sm:size-5" />,
    url: 'ai.sitepow.store',
    videoSrc: '/slip-verify.webm',
    accent: 'from-emerald-500/15 text-emerald-500',
  },
  {
    icon: <IconFlame size={20} className="sm:size-5" />,
    url: 'app.sitepow.store',
    videoSrc: '/gp-section.webm',
    accent: 'from-orange-500/15 text-orange-500',
  },
]

export interface SolutionSectionProps {
  badge?: string
  title?: string
  description?: string
  items?: Array<{ title: string; description: string }>
}

export function SolutionSection({
  badge,
  title,
  description,
  items,
}: SolutionSectionProps = {}) {
  const t = useTranslations('home.solution')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const deckRef = useRef<HTMLDivElement>(null)

  const resolvedBadge = badge ?? t('badge')
  const resolvedTitle = title ?? t('title')
  const resolvedDescription = description ?? t('description')

  const displayItems = SOLUTION_CONFIGS.map((config, idx) => ({
    ...config,
    title: items?.[idx]?.title ?? t(`items.${idx}.title`),
    description: items?.[idx]?.description ?? t(`items.${idx}.description`),
  }))

  const count = displayItems.length

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

      if (deckRef.current) {
        const cards = Array.from(deckRef.current.children)
        const mm = gsap.matchMedia()

        // Mobile (<640px): เลื่อนขึ้นมาตั้งตรง 0 องศา ไม่มีมุมเอียง
        mm.add('(max-width: 639px)', () => {
          gsap.fromTo(
            cards,
            { y: 40, opacity: 0, scale: 0.96 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.7,
              stagger: 0.1,
              ease: 'power3.out',
              clearProps: 'transform',
              scrollTrigger: {
                trigger: deckRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            },
          )
        })

        // Tablet & Desktop (>=640px): แอนิเมชันคลี่ไพ่ออก
        mm.add('(min-width: 640px)', () => {
          gsap.fromTo(
            cards,
            { y: 60, opacity: 0, scale: 0.88 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.9,
              stagger: 0.12,
              ease: 'back.out(1.4)',
              clearProps: 'transform',
              scrollTrigger: {
                trigger: deckRef.current,
                start: 'top 85%',
                toggleActions: 'play none none none',
              },
            },
          )
        })
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef },
  )

  const getCardTransformStyle = (index: number) => {
    if (count <= 1) return {}
    const mid = (count - 1) / 2
    const offset = index - mid
    const rotation = offset * 5 // ใบซ้าย -5deg, กลาง 0deg, ขวา +5deg
    const yOffset = Math.abs(offset) * 12

    return {
      '--card-rotate': `${rotation}deg`,
      '--card-y': `${yOffset}px`,
    } as React.CSSProperties
  }

  return (
    <section
      ref={sectionRef}
      id="solution"
      className="bg-muted/30 border-border/40 relative w-full overflow-hidden border-y py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div ref={headerRef}>
          <MainSectionHeader
            badge={resolvedBadge}
            title={resolvedTitle}
            description={resolvedDescription}
          />
        </div>

        {/* Card Deck Wrapper */}
        <div className="relative mx-auto flex w-full justify-center overflow-visible py-2 sm:py-8 sm:perspective-distant">
          <div
            ref={deckRef}
            className="group/deck flex w-full max-w-6xl flex-col items-center justify-center gap-4 sm:flex-row sm:gap-0 sm:-space-x-12 md:-space-x-16 lg:-space-x-20"
          >
            {displayItems.map((item, idx) => (
              <div
                key={idx}
                style={getCardTransformStyle(idx)}
                className="group border-border/80 bg-card/95 hover:border-primary/50 hover:bg-card /* Mobile: ตั้งตรง 100% ไม่เอียง ไม่ offset */ /* Desktop (sm+): ซ้อนและคลี่เป็นไพ่ */ relative flex w-full max-w-[360px] shrink-0 transform-none flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-lg backdrop-blur-md transition-all duration-500 ease-out sm:[transform:rotate(var(--card-rotate))_translateY(var(--card-y))] sm:p-6 sm:hover:!z-30 sm:hover:!-translate-y-7 sm:hover:!scale-105 sm:hover:!rotate-0 sm:hover:shadow-2xl"
              >
                <div>
                  <div
                    className={`border-border/50 mb-4 flex size-10 items-center justify-center rounded-2xl border bg-gradient-to-br to-transparent shadow-xs transition-transform duration-300 group-hover:scale-110 ${item.accent}`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-foreground group-hover:text-primary text-base font-bold transition-colors sm:text-lg">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground min-h-[44px] pt-1.5 text-xs leading-relaxed sm:text-sm">
                    {item.description}
                  </p>
                </div>

                <div className="border-border/60 bg-muted/20 relative mt-5 overflow-hidden rounded-xl border shadow-inner transition-transform duration-300">
                  <Safari
                    url={item.url}
                    mode={item.videoSrc ? undefined : 'simple'}
                    videoSrc={item.videoSrc}
                    deferVideo={true}
                    className="w-full"
                  >
                    <div className="size-full min-h-36 bg-neutral-200 transition-colors dark:bg-neutral-800" />
                  </Safari>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
