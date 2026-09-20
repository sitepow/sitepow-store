'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import Link from 'next/link'

import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import {
  IconBoxSeam,
  IconBuildingStore,
  IconCoins,
  IconKey,
  IconRobot,
  IconUsers,
  IconWorld,
} from '@tabler/icons-react'

import { BentoCard, BentoGrid } from '@/components/magicui/bento-grid'
import { Button } from '@/components/ui/button'

export interface BentoCardData {
  name: string
  description: string
  cta: string
}

export interface FeaturesBentoSectionProps {
  badge?: string
  title?: string
  description?: string
  allFeaturesBtn?: string
  cards?: {
    pos?: BentoCardData
    ai?: BentoCardData
    zeroGp?: BentoCardData
    inventory?: BentoCardData
    digital?: BentoCardData
    crm?: BentoCardData
    global?: BentoCardData & {
      badges?: {
        zoneRates?: string
        multiCurrency?: string
        stripeGlobal?: string
      }
    }
  }
}

export function FeaturesBentoSection({
  badge,
  title,
  description,
  allFeaturesBtn,
  cards: propCards,
}: FeaturesBentoSectionProps = {}) {
  const t = useTranslations('home.featuresBento')

  const resolvedBadge = badge ?? t('badge')
  const resolvedTitle = title ?? t('title')
  const resolvedDescription = description ?? t('description')
  const resolvedAllFeaturesBtn = allFeaturesBtn ?? t('allFeaturesBtn')

  const cardPos = propCards?.pos ?? {
    name: t('cards.pos.name'),
    description: t('cards.pos.description'),
    cta: t('cards.pos.cta'),
  }
  const cardAi = propCards?.ai ?? {
    name: t('cards.ai.name'),
    description: t('cards.ai.description'),
    cta: t('cards.ai.cta'),
  }
  const cardZeroGp = propCards?.zeroGp ?? {
    name: t('cards.zeroGp.name'),
    description: t('cards.zeroGp.description'),
    cta: t('cards.zeroGp.cta'),
  }
  const cardInventory = propCards?.inventory ?? {
    name: t('cards.inventory.name'),
    description: t('cards.inventory.description'),
    cta: t('cards.inventory.cta'),
  }
  const cardDigital = propCards?.digital ?? {
    name: t('cards.digital.name'),
    description: t('cards.digital.description'),
    cta: t('cards.digital.cta'),
  }
  const cardCrm = propCards?.crm ?? {
    name: t('cards.crm.name'),
    description: t('cards.crm.description'),
    cta: t('cards.crm.cta'),
  }
  const cardGlobal = propCards?.global ?? {
    name: t('cards.global.name'),
    description: t('cards.global.description'),
    cta: t('cards.global.cta'),
  }
  const globalBadges = {
    zoneRates:
      propCards?.global?.badges?.zoneRates ??
      t('cards.global.badges.zoneRates'),
    multiCurrency:
      propCards?.global?.badges?.multiCurrency ??
      t('cards.global.badges.multiCurrency'),
    stripeGlobal:
      propCards?.global?.badges?.stripeGlobal ??
      t('cards.global.badges.stripeGlobal'),
  }

  return (
    <section
      id="features"
      className="bg-muted/40 border-border/40 relative w-full border-y py-16 md:py-24"
    >
      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:px-6 lg:px-8">
        <MainSectionHeader
          badge={resolvedBadge}
          title={resolvedTitle}
          description={resolvedDescription}
        />

        <BentoGrid className="auto-rows-auto sm:auto-rows-80 lg:auto-rows-88">
          <BentoCard
            name={cardPos.name}
            className="col-span-1 md:col-span-2 lg:col-span-2"
            Icon={IconBuildingStore}
            description={cardPos.description}
            href="/features/pos"
            cta={cardPos.cta}
            background={
              <>
                <div className="bg-primary/10 absolute -top-10 -right-10 size-48 rounded-full blur-2xl" />
                <div className="absolute top-16 right-0 bottom-0 w-3/4 overflow-hidden opacity-25 transition-all duration-500 group-hover:scale-105 group-hover:opacity-60 sm:top-12 sm:w-3/5 sm:opacity-50 sm:group-hover:opacity-85">
                  <div className="relative h-full w-full">
                    <Image
                      src="/images/landing/landing-pos.jpeg"
                      alt={cardPos.name}
                      fill
                      className="rounded-tl-2xl border-t border-l border-neutral-200/70 object-cover object-top-left shadow-2xl dark:border-neutral-800/70"
                      sizes="(max-width: 768px) 100vw, 50vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80" />
                    <div className="absolute inset-0 bg-linear-to-t from-white/70 via-transparent to-transparent dark:from-neutral-900/70" />
                  </div>
                </div>
              </>
            }
          />
          <BentoCard
            name={cardAi.name}
            className="col-span-1"
            Icon={IconRobot}
            description={cardAi.description}
            href="/features/ai"
            cta={cardAi.cta}
            background={
              <>
                <div className="absolute -top-8 -right-8 size-48 rounded-full bg-amber-500/10 blur-2xl" />
                <div className="absolute -right-2 -bottom-3 h-28 w-2/3 overflow-hidden rounded-tl-xl border-t border-l border-neutral-200/70 opacity-30 shadow-lg transition-all duration-500 group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:opacity-75 sm:-right-3 sm:-bottom-4 sm:h-36 sm:w-4/5 sm:opacity-60 sm:group-hover:opacity-90 dark:border-neutral-800/70">
                  <div className="relative h-full w-full">
                    <Image
                      src="/images/landing/landing-ai-slip.jpeg"
                      alt={cardAi.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-white/95 via-white/60 to-white/20 dark:from-neutral-900/95 dark:via-neutral-900/70 dark:to-neutral-900/30" />
                    <div className="absolute inset-0 bg-linear-to-r from-white/90 via-white/40 to-transparent dark:from-neutral-900/90 dark:via-neutral-900/40" />
                  </div>
                </div>
              </>
            }
          />
          <BentoCard
            name={cardZeroGp.name}
            className="col-span-1"
            Icon={IconCoins}
            description={cardZeroGp.description}
            href="/features/zero-gp"
            cta={cardZeroGp.cta}
            background={
              <>
                <div className="text-foreground/5 absolute -top-2 right-2 text-8xl font-black select-none">
                  0%
                </div>
                <div className="absolute -right-2 -bottom-3 h-28 w-2/3 overflow-hidden rounded-tl-xl border-t border-l border-neutral-200/70 opacity-30 shadow-lg transition-all duration-500 group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:opacity-75 sm:-right-3 sm:-bottom-4 sm:h-36 sm:w-4/5 sm:opacity-60 sm:group-hover:opacity-90 dark:border-neutral-800/70">
                  <div className="relative h-full w-full">
                    <Image
                      src="/images/landing/landing-payments.jpeg"
                      alt={cardZeroGp.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-white/95 via-white/60 to-white/20 dark:from-neutral-900/95 dark:via-neutral-900/70 dark:to-neutral-900/30" />
                    <div className="absolute inset-0 bg-linear-to-r from-white/90 via-white/40 to-transparent dark:from-neutral-900/90 dark:via-neutral-900/40" />
                  </div>
                </div>
              </>
            }
          />
          <BentoCard
            name={cardInventory.name}
            className="col-span-1"
            Icon={IconBoxSeam}
            description={cardInventory.description}
            href="/features/inventory"
            cta={cardInventory.cta}
            background={
              <>
                <div className="absolute -right-10 -bottom-10 size-40 rounded-full bg-blue-500/10 blur-2xl" />
                <div className="absolute -right-2 -bottom-3 h-28 w-2/3 overflow-hidden rounded-tl-xl border-t border-l border-neutral-200/70 opacity-30 shadow-lg transition-all duration-500 group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:opacity-75 sm:-right-3 sm:-bottom-4 sm:h-36 sm:w-4/5 sm:opacity-60 sm:group-hover:opacity-90 dark:border-neutral-800/70">
                  <div className="relative h-full w-full">
                    <Image
                      src="/images/landing/landing-inventory.jpeg"
                      alt={cardInventory.name}
                      fill
                      className="object-cover object-top-left"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-white/95 via-white/60 to-white/20 dark:from-neutral-900/95 dark:via-neutral-900/70 dark:to-neutral-900/30" />
                    <div className="absolute inset-0 bg-linear-to-r from-white/90 via-white/40 to-transparent dark:from-neutral-900/90 dark:via-neutral-900/40" />
                  </div>
                </div>
              </>
            }
          />
          <BentoCard
            name={cardDigital.name}
            className="col-span-1"
            Icon={IconKey}
            description={cardDigital.description}
            href="/features/online-store"
            cta={cardDigital.cta}
            background={
              <>
                <div className="absolute -top-10 -right-10 size-40 rounded-full bg-purple-500/10 blur-2xl" />
                <div className="absolute -right-2 -bottom-3 h-28 w-2/3 overflow-hidden rounded-tl-xl border-t border-l border-neutral-200/70 opacity-30 shadow-lg transition-all duration-500 group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:opacity-75 sm:-right-3 sm:-bottom-4 sm:h-36 sm:w-4/5 sm:opacity-60 sm:group-hover:opacity-90 dark:border-neutral-800/70">
                  <div className="relative h-full w-full">
                    <Image
                      src="/images/landing/landing-product-boxs.jpeg"
                      alt={cardDigital.name}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-white/95 via-white/60 to-white/20 dark:from-neutral-900/95 dark:via-neutral-900/70 dark:to-neutral-900/30" />
                    <div className="absolute inset-0 bg-linear-to-r from-white/90 via-white/40 to-transparent dark:from-neutral-900/90 dark:via-neutral-900/40" />
                  </div>
                </div>
              </>
            }
          />
          <BentoCard
            name={cardCrm.name}
            className="col-span-1 md:col-span-2 lg:col-span-2"
            Icon={IconUsers}
            description={cardCrm.description}
            href="/features/crm"
            cta={cardCrm.cta}
            background={
              <>
                <div className="bg-primary/10 absolute -right-10 -bottom-10 size-64 rounded-full blur-3xl" />
                <div className="absolute top-16 right-0 bottom-0 w-3/4 overflow-hidden opacity-25 transition-all duration-500 group-hover:scale-105 group-hover:opacity-60 sm:top-12 sm:w-3/5 sm:opacity-50 sm:group-hover:opacity-85 md:w-1/2 lg:w-3/5">
                  <div className="relative h-full w-full">
                    <Image
                      src="/images/landing/landing-loyalty.jpeg"
                      alt={cardCrm.name}
                      fill
                      className="rounded-tl-2xl border-t border-l border-neutral-200/70 object-cover object-top-left shadow-2xl dark:border-neutral-800/70"
                      sizes="(max-width: 768px) 100vw, 60vw"
                    />
                    <div className="absolute inset-0 bg-linear-to-r from-white via-white/80 to-transparent dark:from-neutral-900 dark:via-neutral-900/80" />
                    <div className="absolute inset-0 bg-linear-to-t from-white/70 via-transparent to-transparent dark:from-neutral-900/70" />
                  </div>
                </div>
              </>
            }
          />
          <BentoCard
            name={cardGlobal.name}
            className="col-span-1 md:col-span-2 lg:col-span-1"
            Icon={IconWorld}
            description={cardGlobal.description}
            href="/features/logistics"
            cta={cardGlobal.cta}
            background={
              <>
                <div className="absolute -top-10 -right-10 size-48 rounded-full bg-emerald-500/10 blur-2xl" />
                <div className="absolute inset-x-0 bottom-3 flex flex-col items-center justify-end px-4 pb-2 opacity-50 transition-all duration-500 group-hover:scale-105 group-hover:opacity-95">
                  <div className="flex flex-wrap items-center justify-center gap-1.5">
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                      {globalBadges.zoneRates}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                      {globalBadges.multiCurrency}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-violet-500/30 bg-violet-500/10 px-2.5 py-1 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                      {globalBadges.stripeGlobal}
                    </span>
                  </div>
                </div>
              </>
            }
          />
        </BentoGrid>

        <div className="flex justify-center pt-2">
          <Button
            size="lg"
            variant="outline"
            asChild
            className="h-11 w-full gap-2 rounded-full px-6 text-sm font-semibold shadow-xs transition-all hover:shadow-md sm:w-auto"
          >
            <Link href="/features">
              <span>{resolvedAllFeaturesBtn}</span>
              <IconBuildingStore className="size-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
