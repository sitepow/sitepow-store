'use client'
import { useRef } from 'react'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import { useGSAP } from '@gsap/react'
import {
  IconBoxSeam,
  IconBuildingStore,
  IconCoins,
  IconKey,
  IconRobot,
  IconUsers,
} from '@tabler/icons-react'

import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid'
import { Button } from '@/components/ui/button'

import { gsap } from '@/lib/gsap'

export function FeaturesBentoSection() {
  const t = useTranslations('home.featuresBento')
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<HTMLDivElement>(null)

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

      if (gridRef.current) {
        const cards = gridRef.current.querySelectorAll('.group')
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

  return (
    <section
      ref={sectionRef}
      id="features"
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
        <div ref={gridRef}>
          <BentoGrid className="auto-rows-auto sm:auto-rows-80 lg:auto-rows-88">
            <BentoCard
              name={t('cards.pos.name')}
              className="col-span-1 md:col-span-2 lg:col-span-2"
              Icon={IconBuildingStore}
              description={t('cards.pos.description')}
              href="/features/pos"
              cta={t('cards.pos.cta')}
              background={
                <>
                  <div className="bg-primary/10 absolute -top-10 -right-10 size-48 rounded-full blur-2xl" />
                  <div className="absolute top-16 right-0 bottom-0 w-3/4 overflow-hidden opacity-25 transition-all duration-500 group-hover:scale-105 group-hover:opacity-60 sm:top-12 sm:w-3/5 sm:opacity-50 sm:group-hover:opacity-85">
                    <div className="relative h-full w-full">
                      <Image
                        src="/images/landing/landing-pos.jpeg"
                        alt={t('cards.pos.name')}
                        fill
                        className="rounded-tl-2xl border-t border-l border-neutral-200/70 object-cover object-left-top shadow-2xl dark:border-neutral-800/70"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent dark:from-neutral-900/70" />
                    </div>
                  </div>
                </>
              }
            />
            <BentoCard
              name={t('cards.ai.name')}
              className="col-span-1"
              Icon={IconRobot}
              description={t('cards.ai.description')}
              href="/features/ai"
              cta={t('cards.ai.cta')}
              background={
                <>
                  <div className="absolute -top-8 -right-8 size-48 rounded-full bg-amber-500/10 blur-2xl" />
                  <div className="absolute -right-2 -bottom-3 h-28 w-2/3 overflow-hidden rounded-tl-xl border-t border-l border-neutral-200/70 opacity-30 shadow-lg transition-all duration-500 group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:opacity-75 sm:-right-3 sm:-bottom-4 sm:h-36 sm:w-4/5 sm:opacity-60 sm:group-hover:opacity-90 dark:border-neutral-800/70">
                    <div className="relative h-full w-full">
                      <Image
                        src="/images/landing/landing-ai-slip.jpeg"
                        alt={t('cards.ai.name')}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/60 to-white/20 dark:from-neutral-900/95 dark:via-neutral-900/70 dark:to-neutral-900/30" />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent dark:from-neutral-900/90 dark:via-neutral-900/40" />
                    </div>
                  </div>
                </>
              }
            />
            <BentoCard
              name={t('cards.zeroGp.name')}
              className="col-span-1"
              Icon={IconCoins}
              description={t('cards.zeroGp.description')}
              href="/features/zero-gp"
              cta={t('cards.zeroGp.cta')}
              background={
                <>
                  <div className="text-foreground/5 absolute -top-2 right-2 text-8xl font-black select-none">
                    0%
                  </div>
                  <div className="absolute -right-2 -bottom-3 h-28 w-2/3 overflow-hidden rounded-tl-xl border-t border-l border-neutral-200/70 opacity-30 shadow-lg transition-all duration-500 group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:opacity-75 sm:-right-3 sm:-bottom-4 sm:h-36 sm:w-4/5 sm:opacity-60 sm:group-hover:opacity-90 dark:border-neutral-800/70">
                    <div className="relative h-full w-full">
                      <Image
                        src="/images/landing/landing-payments.jpeg"
                        alt={t('cards.zeroGp.name')}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/60 to-white/20 dark:from-neutral-900/95 dark:via-neutral-900/70 dark:to-neutral-900/30" />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent dark:from-neutral-900/90 dark:via-neutral-900/40" />
                    </div>
                  </div>
                </>
              }
            />
            <BentoCard
              name={t('cards.inventory.name')}
              className="col-span-1"
              Icon={IconBoxSeam}
              description={t('cards.inventory.description')}
              href="/features/inventory"
              cta={t('cards.inventory.cta')}
              background={
                <>
                  <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-blue-500/10 blur-2xl" />
                  <div className="absolute -right-2 -bottom-3 h-28 w-2/3 overflow-hidden rounded-tl-xl border-t border-l border-neutral-200/70 opacity-30 shadow-lg transition-all duration-500 group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:opacity-75 sm:-right-3 sm:-bottom-4 sm:h-36 sm:w-4/5 sm:opacity-60 sm:group-hover:opacity-90 dark:border-neutral-800/70">
                    <div className="relative h-full w-full">
                      <Image
                        src="/images/landing/landing-inventory.jpeg"
                        alt={t('cards.inventory.name')}
                        fill
                        className="object-cover object-left-top"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/60 to-white/20 dark:from-neutral-900/95 dark:via-neutral-900/70 dark:to-neutral-900/30" />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent dark:from-neutral-900/90 dark:via-neutral-900/40" />
                    </div>
                  </div>
                </>
              }
            />
            <BentoCard
              name={t('cards.digital.name')}
              className="col-span-1"
              Icon={IconKey}
              description={t('cards.digital.description')}
              href="/features/online-store"
              cta={t('cards.digital.cta')}
              background={
                <>
                  <div className="absolute -top-10 -right-10 size-40 rounded-full bg-purple-500/10 blur-2xl" />
                  <div className="absolute -right-2 -bottom-3 h-28 w-2/3 overflow-hidden rounded-tl-xl border-t border-l border-neutral-200/70 opacity-30 shadow-lg transition-all duration-500 group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:opacity-75 sm:-right-3 sm:-bottom-4 sm:h-36 sm:w-4/5 sm:opacity-60 sm:group-hover:opacity-90 dark:border-neutral-800/70">
                    <div className="relative h-full w-full">
                      <Image
                        src="/images/landing/landing-product-boxs.jpeg"
                        alt={t('cards.digital.name')}
                        fill
                        className="object-cover object-top"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/60 to-white/20 dark:from-neutral-900/95 dark:via-neutral-900/70 dark:to-neutral-900/30" />
                      <div className="absolute inset-0 bg-gradient-to-r from-white/90 via-white/40 to-transparent dark:from-neutral-900/90 dark:via-neutral-900/40" />
                    </div>
                  </div>
                </>
              }
            />
            <BentoCard
              name={t('cards.crm.name')}
              className="col-span-1 md:col-span-2 lg:col-span-3"
              Icon={IconUsers}
              description={t('cards.crm.description')}
              href="/features/crm"
              cta={t('cards.crm.cta')}
              background={
                <>
                  <div className="bg-primary/10 absolute -right-10 -bottom-10 size-64 rounded-full blur-3xl" />
                  <div className="absolute top-16 right-0 bottom-0 w-3/4 overflow-hidden opacity-25 transition-all duration-500 group-hover:scale-105 group-hover:opacity-60 sm:top-12 sm:w-3/5 sm:opacity-50 sm:group-hover:opacity-85 md:w-1/2 lg:w-3/5">
                    <div className="relative h-full w-full">
                      <Image
                        src="/images/landing/landing-loyalty.jpeg"
                        alt={t('cards.crm.name')}
                        fill
                        className="rounded-tl-2xl border-t border-l border-neutral-200/70 object-cover object-left-top shadow-2xl dark:border-neutral-800/70"
                        sizes="(max-width: 768px) 100vw, 60vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent dark:from-neutral-900/70" />
                    </div>
                  </div>
                </>
              }
            />
          </BentoGrid>
        </div>
        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-11 w-full gap-2 rounded-full px-6 text-sm font-semibold shadow-xs transition-all hover:shadow-md sm:w-auto"
          >
            <Link href="/features">
              <span>{t('allFeaturesBtn')}</span>
              <IconBuildingStore className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
