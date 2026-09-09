'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { FeatureItem } from '@/constants/features'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { IconArrowRight } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

import { MainSectionHeader } from '../../../_components/MainSectionHeader'

export function RelatedFeaturesSection({
  relatedFeatures,
}: {
  relatedFeatures: FeatureItem[]
}) {
  const isMounted = useIsMounted()
  const t = useTranslations('features.detail.related')
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
    { scope: sectionRef, dependencies: [isMounted, relatedFeatures] },
  )

  return (
    <div
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-6 sm:px-6 lg:px-8"
    >
      <div ref={headerRef}>
        <MainSectionHeader
          as="h3"
          title={t('title')}
          description={t('description')}
        />
      </div>
      <div
        ref={cardsRef}
        className="grid grid-cols-1 gap-3 sm:gap-6 md:grid-cols-3"
      >
        {relatedFeatures.map((rel) => (
          <div
            key={rel.slug}
            className="group border-border/80 bg-card/60 hover:border-border hover:bg-card relative flex flex-col justify-between rounded-2xl border p-4 shadow-xs transition-all duration-300 sm:rounded-3xl sm:p-6"
          >
            <Link
              href={`/features/${rel.slug}`}
              className="absolute inset-0 z-10 cursor-pointer"
              aria-label={rel.title}
            />
            <div>
              <div className="flex items-center gap-2.5 sm:gap-3">
                <div className="bg-primary/10 text-primary mb-2.5 flex size-9 shrink-0 items-center justify-center rounded-xl sm:mb-4 sm:size-10">
                  {rel.icon}
                </div>
                <div>
                  <h4 className="text-foreground group-hover:text-primary text-xs font-bold transition-colors sm:text-sm">
                    {rel.title}
                  </h4>
                  <span className="text-muted-foreground text-[10px]">
                    {rel.categoryLabel}
                  </span>
                </div>
              </div>
              <p className="text-muted-foreground line-clamp-2 pt-2 text-xs leading-relaxed sm:pt-3">
                {rel.shortDescription}
              </p>
            </div>
            <div className="relative z-20 pt-3 sm:pt-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="group-hover:text-primary w-full cursor-pointer justify-between px-2 text-xs font-semibold"
              >
                <Link href={`/features/${rel.slug}`}>
                  <span>{t('learnMore')}</span>
                  <IconArrowRight size={14} />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
