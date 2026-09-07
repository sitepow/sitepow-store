'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { FeatureItem } from '@/constants/features'
import {
  IconArrowLeft,
  IconArrowRight,
  IconBuildingStore,
  IconCheck,
  IconChevronRight,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

export function FeatureHeroSection({
  feature,
  registerHref,
}: {
  feature: FeatureItem
  registerHref: string
}) {
  const t = useTranslations('features.detail')
  return (
    <div className="relative mx-auto w-full max-w-5xl space-y-4 px-3.5 pt-3 pb-2 text-center sm:space-y-8 sm:px-6 sm:pt-6 sm:pb-4 lg:px-8">
      <div className="bg-primary/10 pointer-events-none absolute top-1/2 left-1/2 -z-10 size-96 -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" />
      <div className="text-muted-foreground flex flex-wrap items-center justify-center gap-1.5 text-xs font-medium sm:gap-2">
        <Link
          href="/features"
          className="hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <IconArrowLeft size={14} />
          <span>{t('backToAll')}</span>
        </Link>
        <IconChevronRight size={12} />
        <span className="text-primary bg-primary/10 border-primary/20 rounded-full border px-2 py-0.5 text-[11px] font-semibold sm:px-2.5 sm:text-xs">
          {feature.categoryLabel}
        </span>
      </div>
      <div className="space-y-2.5 sm:space-y-4">
        <div className="bg-card/80 text-primary border-border/80 shadow-primary/5 mx-auto inline-flex size-14 items-center justify-center rounded-2xl border shadow-xl backdrop-blur-md sm:size-20 sm:rounded-3xl">
          {feature.icon}
        </div>
        <h1 className="text-foreground text-2xl font-extrabold tracking-tight text-balance sm:text-5xl md:text-6xl">
          {feature.title}
        </h1>
        <p className="text-primary text-sm font-semibold sm:text-xl">
          {feature.tagline}
        </p>
        <p className="text-muted-foreground mx-auto max-w-3xl text-xs leading-relaxed text-balance sm:text-base">
          {feature.fullDescription}
        </p>
      </div>
      <div className="mx-auto flex w-full max-w-md flex-col items-stretch justify-center gap-2.5 pt-1 sm:max-w-none sm:flex-row sm:items-center sm:gap-3 sm:pt-2">
        <Button
          size="lg"
          asChild
          className="shadow-primary/25 h-10 w-full cursor-pointer rounded-full px-6 text-xs font-semibold shadow-lg transition-transform hover:scale-105 sm:h-12 sm:w-auto sm:px-7 sm:text-sm"
        >
          <Link
            href={registerHref}
            className="flex items-center justify-center gap-2"
          >
            <IconBuildingStore size={16} className="sm:size-[18px]" />
            <span>{t('registerBtn')}</span>
            <IconArrowRight size={15} />
          </Link>
        </Button>
        <Button
          variant="outline"
          size="lg"
          asChild
          className="h-10 w-full cursor-pointer rounded-full px-6 text-xs font-medium transition-all sm:h-12 sm:w-auto sm:px-7 sm:text-sm"
        >
          <Link href="/pricing" className="text-center">
            {t('pricingBtn')}
          </Link>
        </Button>
      </div>
      <div className="mx-auto grid max-w-4xl grid-cols-1 gap-2.5 pt-2 sm:grid-cols-3 sm:gap-4 sm:pt-4">
        {feature.metrics.map((metric, mIdx) => (
          <div
            key={mIdx}
            className="bg-card/70 border-border/80 relative flex flex-col items-center justify-center rounded-2xl border p-3.5 shadow-xs backdrop-blur-md transition-all duration-300 hover:shadow-md sm:rounded-3xl sm:p-5"
          >
            <div className="text-foreground text-2xl font-black tracking-tight sm:text-4xl">
              <span className="from-primary bg-linear-to-r to-orange-500 bg-clip-text text-transparent">
                {metric.value}
              </span>
            </div>
            <div className="text-foreground pt-1 text-xs font-bold sm:text-sm">
              {metric.label}
            </div>
            <div className="text-muted-foreground pt-0.5 text-center text-[11px] sm:text-xs">
              {metric.desc}
            </div>
          </div>
        ))}
      </div>
      <div className="mx-auto grid max-w-3xl grid-cols-1 gap-2 pt-1 text-left text-xs sm:grid-cols-2 sm:gap-3 sm:pt-2 sm:text-sm">
        {feature.highlights.map((item, idx) => (
          <div
            key={idx}
            className="bg-card/60 border-border/60 flex items-center gap-2 rounded-xl border p-2.5 shadow-2xs sm:rounded-2xl sm:p-3.5"
          >
            <div className="flex size-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 sm:size-5 dark:text-emerald-400">
              <IconCheck size={12} strokeWidth={3} />
            </div>
            <span className="text-foreground/90 leading-tight font-medium">
              {item}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
