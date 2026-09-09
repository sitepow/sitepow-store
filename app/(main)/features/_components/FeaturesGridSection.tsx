'use client'
import { useRef, useState } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { FEATURE_IMAGES, getLocalizedFeatures } from '@/constants/features'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { IconArrowRight, IconCheck } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

import { ScrollTrigger, gsap, useGSAP } from '@/lib/gsap'

const CATEGORIES = [
  { id: 'all', key: 'all' },
  { id: 'pos', key: 'pos' },
  { id: 'ai', key: 'ai' },
  { id: 'inventory', key: 'inventory' },
  { id: 'sales', key: 'sales' },
  { id: 'marketing', key: 'marketing' },
]

export function FeaturesGridSection() {
  const isMounted = useIsMounted()
  const t = useTranslations('features')
  const features = getLocalizedFeatures(t)
  const [selectedCat, setSelectedCat] = useState('all')
  const filteredFeatures =
    selectedCat === 'all'
      ? features
      : features.filter((f) => f.category === selectedCat)

  const sectionRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)
  const hasAnimatedTabs = useRef(false)

  useGSAP(
    () => {
      if (!isMounted) return

      if (tabsRef.current && !hasAnimatedTabs.current) {
        hasAnimatedTabs.current = true
        gsap.fromTo(
          tabsRef.current,
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: tabsRef.current,
              start: 'top 92%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      if (gridRef.current) {
        const cards = Array.from(gridRef.current.children)
        cards.forEach((card) => {
          gsap.fromTo(
            card,
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              ease: 'power3.out',
              scrollTrigger: {
                trigger: card,
                start: 'top 92%',
                toggleActions: 'play none none none',
              },
            },
          )
        })
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef, dependencies: [isMounted, selectedCat] },
  )

  return (
    <div
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl space-y-4 px-3.5 sm:space-y-8 sm:px-6 lg:px-8"
    >
      <div ref={tabsRef} className="flex justify-center">
        <div className="bg-muted/70 border-border/80 inline-flex max-w-full flex-wrap items-center justify-center gap-0.5 rounded-xl border p-1 shadow-xs sm:gap-1 sm:rounded-2xl sm:p-1.5">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCat === cat.id
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold transition-all duration-200 sm:rounded-xl sm:px-3.5 sm:py-1.5 sm:text-sm ${
                  isSelected
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t(`categories.${cat.key}`)}
              </button>
            )
          })}
        </div>
      </div>
      <div
        ref={gridRef}
        className="grid grid-cols-1 gap-3.5 sm:gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {filteredFeatures.map((feat) => (
          <div
            key={feat.slug}
            className="group border-border/80 bg-card/60 hover:border-border hover:bg-card relative flex flex-col justify-between overflow-hidden rounded-2xl border p-3.5 shadow-xs transition-all duration-300 hover:shadow-md sm:rounded-3xl sm:p-5"
          >
            <div>
              <div className="border-border/60 bg-muted/40 relative mb-3 aspect-[16/9] w-full overflow-hidden rounded-xl border sm:mb-4">
                <Image
                  src={
                    feat.image ||
                    FEATURE_IMAGES[feat.slug] ||
                    '/images/landing/landing-pos.jpeg'
                  }
                  alt={feat.title}
                  fill
                  className="object-cover object-top transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="from-card/90 absolute inset-0 bg-gradient-to-t via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                  <div className="bg-background/90 text-primary flex size-8 items-center justify-center rounded-lg shadow-xs backdrop-blur-md">
                    {feat.icon}
                  </div>
                </div>
                <div className="absolute top-2.5 right-2.5">
                  <span className="bg-background/90 text-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold shadow-xs backdrop-blur-md">
                    {feat.categoryLabel}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-foreground group-hover:text-primary text-base font-bold transition-colors sm:text-lg">
                  {feat.title}
                </h3>
                <p className="text-muted-foreground min-h-auto pt-1 text-xs leading-relaxed sm:min-h-12 sm:pt-2">
                  {feat.shortDescription}
                </p>
              </div>
              <div className="border-border/60 my-3.5 border-t sm:my-5" />
              <ul className="space-y-1.5 text-xs sm:space-y-2">
                {feat.highlights.slice(0, 3).map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div
                      className="text-primary mt-0.5 shrink-0"
                      aria-hidden="true"
                    >
                      <IconCheck size={14} />
                    </div>
                    <span className="text-foreground/90 leading-snug">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={`/features/${feat.slug}`}
              className="absolute inset-0 z-10 cursor-pointer"
              aria-label={feat.title}
            />
            <div className="relative z-20 pt-4 sm:pt-6">
              <Button
                asChild
                variant="outline"
                className="group-hover:border-primary group-hover:text-primary flex h-9 w-full cursor-pointer items-center justify-center gap-1.5 text-xs font-semibold transition-all sm:h-10"
              >
                <Link href={`/features/${feat.slug}`}>
                  <span>{t('viewDetailBtn')}</span>
                  <IconArrowRight
                    size={14}
                    className="transition-transform group-hover:translate-x-0.5"
                  />
                </Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
