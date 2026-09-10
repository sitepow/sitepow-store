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
  const deckRef = useRef<HTMLDivElement>(null)

  const count = relatedFeatures.length

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

      if (deckRef.current) {
        const cards = Array.from(deckRef.current.children)
        gsap.fromTo(
          cards,
          {
            y: 50,
            opacity: 0,
            scale: 0.9,
          },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.85,
            stagger: 0.1,
            ease: 'back.out(1.2)',
            scrollTrigger: {
              trigger: deckRef.current,
              start: 'top 85%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef, dependencies: [isMounted, relatedFeatures] },
  )

  // คำนวณองศาและระยะเลื่อนสำหรับ Desktop (Mobile จะถูก override เป็น 0 โดย CSS)
  const getCardTransformStyle = (index: number) => {
    if (count <= 1) {
      return {
        '--card-rotate': '0deg',
        '--card-y': '0px',
      } as React.CSSProperties
    }

    const mid = (count - 1) / 2
    const offset = index - mid
    const rotation = offset * 5.5 // ใบซ้าย -5.5deg, กลาง 0deg, ขวา +5.5deg
    const yOffset = Math.abs(offset) * 10 // ใบข้างดรอปต่ำลง 10px เป็นทรงพัด

    return {
      '--card-rotate': `${rotation}deg`,
      '--card-y': `${yOffset}px`,
    } as React.CSSProperties
  }

  return (
    <div
      ref={sectionRef}
      className="mx-auto w-full max-w-7xl space-y-6 px-3.5 sm:space-y-10 sm:px-6 lg:px-8"
    >
      <div ref={headerRef}>
        <MainSectionHeader
          as="h3"
          title={t('title')}
          description={t('description')}
        />
      </div>

      {/* Card Deck Wrapper */}
      <div className="relative mx-auto flex w-full justify-center overflow-visible py-4 perspective-distant sm:py-8">
        <div
          ref={deckRef}
          className="group/deck flex w-full max-w-5xl flex-col items-center justify-center gap-4 sm:flex-row sm:-space-x-14 md:-space-x-20 lg:-space-x-24"
        >
          {relatedFeatures.map((rel, index) => (
            <div
              key={rel.slug}
              style={getCardTransformStyle(index)}
              className="group border-border/80 bg-card/90 /* Mobile: การ์ดตรงปกติ ไม่เอียง ไม่งอ */ /* Desktop (sm ขึ้นไป): เอียงแบบคลี่ไพ่ตาม CSS Variables */ /* Desktop Hover: ดีดขึ้นมาตั้งตรง ลอยตัว และขึ้นมาอยู่เลเยอร์หน้าสุด */ hover:border-primary/50 hover:bg-card relative flex w-full max-w-[340px] shrink-0 translate-y-0 rotate-0 flex-col justify-between overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-500 ease-out hover:!z-30 hover:shadow-2xl sm:[transform:rotate(var(--card-rotate))_translateY(var(--card-y))] sm:rounded-3xl sm:p-5 sm:hover:!-translate-y-7 sm:hover:!scale-105 sm:hover:!rotate-0"
            >
              <Link
                href={`/features/${rel.slug}`}
                className="absolute inset-0 z-10 cursor-pointer"
                aria-label={rel.title}
              />
              <div>
                <div className="border-border/60 bg-muted/40 relative mb-3 aspect-[16/10] w-full overflow-hidden rounded-xl border shadow-inner">
                  <Image
                    src={
                      rel.image ||
                      FEATURE_IMAGES[rel.slug] ||
                      '/images/landing/landing-pos.jpeg'
                    }
                    alt={rel.title}
                    fill
                    className="object-cover object-top transition-transform duration-500 group-hover:scale-108"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <div className="from-card via-card/20 absolute inset-0 bg-gradient-to-t to-transparent opacity-90" />
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-2">
                    <div className="bg-background/90 text-primary flex size-7.5 items-center justify-center rounded-lg shadow-sm backdrop-blur-md">
                      {rel.icon}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-foreground group-hover:text-primary text-xs font-bold transition-colors sm:text-sm">
                    {rel.title}
                  </h4>
                  <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                    {rel.categoryLabel}
                  </span>
                </div>

                <p className="text-muted-foreground line-clamp-2 pt-1.5 text-xs leading-relaxed">
                  {rel.shortDescription}
                </p>
              </div>

              <div className="relative z-20 pt-3 sm:pt-4">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="group-hover:bg-primary/10 group-hover:text-primary w-full cursor-pointer justify-between px-2.5 text-xs font-semibold"
                >
                  <Link href={`/features/${rel.slug}`}>
                    <span>{t('learnMore')}</span>
                    <IconArrowRight
                      size={14}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
