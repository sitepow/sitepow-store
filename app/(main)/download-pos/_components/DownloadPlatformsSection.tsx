'use client'
import React, { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { useGSAP } from '@gsap/react'
import {
  IconCheck,
  IconClock,
  IconSparkles,
  IconWorld,
} from '@tabler/icons-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'

import { gsap } from '@/lib/gsap'

import { MainSectionHeader } from '../../_components/MainSectionHeader'

interface PlatformConfig {
  id: 'windows' | 'android' | 'ios' | 'macos'
  version: string
  size: string
  requirements: string
  icon: React.ReactNode
  isFeatured?: boolean
}

const PLATFORM_CONFIGS: PlatformConfig[] = [
  {
    id: 'windows',
    version: 'v2.4.0 (Latest)',
    size: '85 MB',
    requirements: 'Windows 10 / 11 (64-bit)',
    icon: (
      <Image
        src="/images/platforms/windows.svg"
        alt="Windows logo"
        width={32}
        height={32}
        className="size-6.5 object-contain sm:size-7.5"
        unoptimized
      />
    ),
    isFeatured: true,
  },
  {
    id: 'android',
    version: 'v2.4.0',
    size: '45 MB',
    requirements: 'Android 8.0+',
    icon: (
      <Image
        src="/images/platforms/android.svg"
        alt="Android logo"
        width={32}
        height={32}
        className="size-6.5 object-contain sm:size-7.5"
        unoptimized
      />
    ),
  },
  {
    id: 'ios',
    version: 'v2.4.0',
    size: '38 MB',
    requirements: 'iPadOS / iOS 15.0+',
    icon: (
      <Image
        src="/images/platforms/apple.svg"
        alt="Apple iOS logo"
        width={32}
        height={32}
        className="size-6.5 object-contain sm:size-7.5 dark:invert"
        unoptimized
      />
    ),
  },
  {
    id: 'macos',
    version: 'v2.4.0',
    size: '92 MB',
    requirements: 'macOS 12.0+ (Apple Silicon & Intel)',
    icon: (
      <Image
        src="/images/platforms/macos.svg"
        alt="macOS Finder logo"
        width={32}
        height={32}
        className="size-6.5 rounded-md object-contain shadow-xs sm:size-7.5"
        unoptimized
      />
    ),
  },
]

export function DownloadPlatformsSection() {
  const t = useTranslations('downloadPos.platforms')
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
            { y: 50, scale: 0.95, opacity: 0 },
            {
              y: 0,
              scale: 1,
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

  const platforms = PLATFORM_CONFIGS.map((p) => ({
    ...p,
    name: t(`items.${p.id}.name`),
    badge: t(`items.${p.id}.badge`),
    description: t(`items.${p.id}.description`),
    features: [0, 1, 2, 3].map((fIdx) => t(`items.${p.id}.features.${fIdx}`)),
  }))

  return (
    <section
      ref={sectionRef}
      id="platforms"
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
        className="grid grid-cols-1 gap-3.5 sm:gap-6 md:grid-cols-2 lg:grid-cols-4"
      >
        {platforms.map((platform) => (
          <div
            key={platform.id}
            className={`relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-300 sm:rounded-3xl sm:p-6 ${
              platform.isFeatured
                ? 'border-primary bg-card/90 ring-primary/20 border-2 shadow-xl ring-1 lg:-translate-y-2'
                : 'border-border/80 bg-card/60 hover:border-border border hover:shadow-md'
            }`}
          >
            {platform.isFeatured && (
              <>
                <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm sm:-top-3.5 sm:px-3 sm:text-xs">
                  {t('recommendedBadge')}
                </div>
                <BorderBeam
                  size={140}
                  duration={8}
                  colorFrom="#f97316"
                  colorTo="#3b82f6"
                  borderWidth={2}
                />
              </>
            )}
            <div>
              <div className="flex items-start justify-between">
                <div className="bg-muted/60 border-border/50 flex size-11 items-center justify-center rounded-xl border shadow-xs sm:size-12 sm:rounded-2xl">
                  {platform.icon}
                </div>
                <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-semibold sm:px-2.5">
                  {platform.badge}
                </span>
              </div>
              <div className="pt-2.5 sm:pt-4">
                <h3 className="text-foreground text-base font-bold sm:text-lg">
                  {platform.name}
                </h3>
                <div className="text-muted-foreground flex items-center gap-2 pt-0.5 text-[11px]">
                  <span>{platform.version}</span>
                  <span>•</span>
                  <span>{platform.size}</span>
                </div>
                <p className="text-muted-foreground min-h-auto pt-1.5 text-xs leading-relaxed sm:min-h-12 sm:pt-2.5">
                  {platform.description}
                </p>
              </div>
              <div className="border-border/60 my-3.5 border-t sm:my-5" />
              <ul className="space-y-2 text-xs sm:space-y-2.5">
                {platform.features.map((feat, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <div
                      className="text-primary mt-0.5 shrink-0"
                      aria-hidden="true"
                    >
                      <IconCheck size={14} />
                    </div>
                    <span className="text-foreground/90 leading-snug">
                      {feat}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-2 pt-4 sm:pt-6">
              <Button
                disabled
                variant="outline"
                className={`flex h-9 w-full cursor-not-allowed items-center justify-center gap-1.5 text-xs font-semibold select-none ${
                  platform.isFeatured
                    ? 'border-primary/40 bg-primary/10 text-primary dark:border-primary/40 dark:bg-primary/15'
                    : 'border-border/80 bg-muted/50 text-muted-foreground'
                }`}
              >
                <IconClock size={15} />
                <span>{t('comingSoon')}</span>
              </Button>
              <div className="text-muted-foreground pt-0.5 text-center text-[10px]">
                {t('systemRequirements')} {platform.requirements}
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-primary/5 border-primary/20 relative flex flex-col items-center justify-between gap-4 overflow-hidden rounded-2xl border p-4 sm:gap-6 sm:rounded-3xl sm:p-8 md:flex-row">
        <div className="space-y-1.5 text-center sm:space-y-2 md:text-left">
          <div className="bg-primary/10 text-primary inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold">
            <IconSparkles size={14} />
            <span>{t('webBanner.badge')}</span>
          </div>
          <h3 className="text-foreground text-lg font-bold sm:text-2xl">
            {t('webBanner.title')}
          </h3>
          <p className="text-muted-foreground max-w-2xl text-xs sm:text-sm">
            {t('webBanner.description')}
          </p>
        </div>
        <RainbowButton
          size="lg"
          asChild
          className="h-10 w-full shrink-0 sm:h-11 sm:w-auto"
        >
          <Link
            href="/merchant/pos"
            target="_blank"
            className="flex items-center justify-center gap-2"
          >
            <IconWorld size={16} />
            <span>{t('webBanner.btn')}</span>
          </Link>
        </RainbowButton>
      </div>
    </section>
  )
}
