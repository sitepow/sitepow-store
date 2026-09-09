'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { FEATURE_IMAGES, FeatureItem } from '@/constants/features'
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
            className="group border-border/80 bg-card/60 hover:border-border hover:bg-card relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3.5 shadow-xs transition-all duration-300 sm:rounded-3xl sm:p-5"
          >
            <Link
              href={`/features/${rel.slug}`}
              className="absolute inset-0 z-10 cursor-pointer"
              aria-label={rel.title}
            />
            <div>
              <div className="border-border/60 bg-muted/40 relative mb-3 aspect-[16/10] w-full overflow-hidden rounded-xl border">
                <Image
                  src={
                    rel.image ||
                    FEATURE_IMAGES[rel.slug] ||
                    '/images/landing/landing-pos.jpeg'
                  }
                  alt={rel.title}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="from-card/90 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                <div className="absolute top-2 left-2 flex items-center gap-2">
                  <div className="bg-background/90 text-primary flex size-7 items-center justify-center rounded-md shadow-xs backdrop-blur-md">
                    {rel.icon}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-foreground group-hover:text-primary text-xs font-bold transition-colors sm:text-sm">
                  {rel.title}
                </h4>
                <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium">
                  {rel.categoryLabel}
                </span>
              </div>
              <p className="text-muted-foreground line-clamp-2 pt-1 text-xs leading-relaxed sm:pt-1.5">
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
