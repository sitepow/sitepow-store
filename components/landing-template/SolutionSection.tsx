'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'

import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import { useGSAP } from '@gsap/react'
import { IconCpu, IconFlame, IconQrcode } from '@tabler/icons-react'

import { Safari } from '@/components/magicui/safari'

import { gsap } from '@/lib/gsap'

const SOLUTION_CONFIGS = [
  {
    icon: <IconQrcode size={22} />,
    url: 'pos.sitepow.store',
    videoSrc: '/pos-section.webm',
  },
  {
    icon: <IconCpu size={22} />,
    url: 'ai.sitepow.store',
  },
  {
    icon: <IconFlame size={22} />,
    url: 'app.sitepow.store',
  },
]

export function SolutionSection() {
  const t = useTranslations('home.solution')
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
            { y: 55, opacity: 0 },
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

  const items = SOLUTION_CONFIGS.map((config, idx) => ({
    ...config,
    title: t(`items.${idx}.title`),
    description: t(`items.${idx}.description`),
  }))
  return (
    <section
      ref={sectionRef}
      id="solution"
      className="bg-muted/40 border-border/40 relative w-full border-y py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <div ref={headerRef}>
          <MainSectionHeader
            badge={t('badge')}
            title={t('title')}
            description={t('description')}
          />
        </div>
        <div
          ref={cardsRef}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {items.map((item, idx) => (
            <div
              key={idx}
              className="group border-border/80 bg-card/60 hover:border-border hover:bg-card relative flex flex-col justify-between overflow-hidden rounded-3xl border p-5 shadow-xs transition-all duration-300 hover:shadow-md sm:p-6"
            >
              <div>
                <div className="bg-primary/10 text-primary mb-4 flex size-10 items-center justify-center rounded-xl">
                  {item.icon}
                </div>
                <h3 className="text-foreground text-lg font-bold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground pt-2 text-xs leading-relaxed sm:text-sm">
                  {item.description}
                </p>
              </div>
              <div className="border-border relative mt-6 overflow-hidden rounded-xl border shadow-xs transition-transform duration-300 group-hover:-translate-y-1">
                <Safari
                  url={item.url}
                  mode={item.videoSrc ? undefined : 'simple'}
                  videoSrc={item.videoSrc}
                  className="w-full"
                >
                  {!item.videoSrc && (
                    <div className="aspect-video size-full bg-neutral-200 dark:bg-neutral-800" />
                  )}
                </Safari>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
