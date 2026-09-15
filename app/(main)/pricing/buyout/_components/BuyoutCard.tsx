'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { BuyoutPlan } from '@/constants/buyout'
import { useIsMounted } from '@/hooks/use-is-mounted'
import {
  IconCheck,
  IconGift,
  IconHeadset,
  IconServer,
  IconSparkles,
} from '@tabler/icons-react'
import { ArrowRight } from 'lucide-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'

interface BuyoutCardProps {
  plan: BuyoutPlan
  planIndex: number
}

export function BuyoutCard({ plan, planIndex }: BuyoutCardProps) {
  const isMounted = useIsMounted()
  const t = useTranslations('buyout')

  if (!isMounted) return null

  // Fallback to constants if translation key is missing
  let title = plan.title
  let subtitle = plan.subtitle
  let description = plan.description
  let price = plan.price
  let originalPrice = plan.originalPrice
  let features = plan.features.map((f) => f.text)
  let freeServices = plan.freeServices

  try {
    title = (t.raw(`plans.${planIndex}.title`) as string) || plan.title
    subtitle = (t.raw(`plans.${planIndex}.subtitle`) as string) || plan.subtitle
    description =
      (t.raw(`plans.${planIndex}.description`) as string) || plan.description
    price = (t.raw(`plans.${planIndex}.price`) as string) || plan.price
    originalPrice =
      (t.raw(`plans.${planIndex}.originalPrice`) as string) ||
      plan.originalPrice
    const translatedFeatures = t.raw(`plans.${planIndex}.features`) as string[]
    if (Array.isArray(translatedFeatures)) {
      features = translatedFeatures
    }
    const translatedFree = t.raw(`plans.${planIndex}.freeServices`) as string[]
    if (Array.isArray(translatedFree)) {
      freeServices = translatedFree
    }
  } catch {}

  const contactHref = `/contact?subject=${encodeURIComponent(
    `สนใจซื้อระบบขาด แพ็กเกจ ${title}`,
  )}`

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-visible rounded-3xl p-5 backdrop-blur-md transition-all duration-300 sm:p-6.5 ${
        plan.isPopular
          ? 'border-primary/80 bg-card/95 ring-primary/25 border-2 shadow-2xl ring-2 lg:-translate-y-3 lg:hover:-translate-y-4'
          : 'border-border/80 bg-card/70 hover:border-border hover:bg-card border shadow-xs hover:-translate-y-2 hover:shadow-xl'
      }`}
    >
      {plan.isPopular && (
        <>
          <div className="bg-primary text-primary-foreground absolute -top-3.5 left-1/2 z-20 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold shadow-md">
            {t('card.popularBadge')}
          </div>
          <BorderBeam
            size={160}
            duration={7}
            colorFrom="#f97316"
            colorTo="#3b82f6"
            borderWidth={2}
          />
          <BorderBeam
            size={160}
            duration={7}
            delay={3.5}
            colorFrom="#10b981"
            colorTo="#f59e0b"
            borderWidth={2}
          />
        </>
      )}

      <div>
        {/* Header & Badges */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              {title}
            </h3>
            <p className="text-primary pt-0.5 text-xs font-semibold">
              {subtitle}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              <IconServer className="size-3 shrink-0" />
              {t('card.freeInstallBadge')}
            </span>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
              <IconHeadset className="size-3 shrink-0" />
              {t('card.freeSupportBadge')}
            </span>
          </div>
        </div>

        {/* Pricing Block */}
        <div className="pt-3 sm:pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground text-xs line-through opacity-80">
              {t('card.originalPrice', { price: originalPrice })}
            </span>
            <span className="rounded-md bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
              {t('card.saveAmount', { amount: plan.saveAmount })}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-foreground text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              ฿{price}
            </span>
            <span className="text-muted-foreground text-xs font-semibold">
              / {t('card.oneTimePayment')}
            </span>
          </div>

          <p className="text-muted-foreground pt-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            ✓ {plan.breakEvenNote}
          </p>
        </div>

        <p className="text-muted-foreground min-h-9 pt-2.5 text-xs leading-relaxed">
          {description}
        </p>

        {/* Special Free Inclusions Box */}
        <div className="border-primary/25 bg-primary/5 mt-4 rounded-2xl border p-3 sm:p-3.5">
          <div className="text-primary flex items-center gap-1.5 pb-2 text-xs font-bold">
            <IconGift className="size-4 shrink-0" />
            <span>{t('card.freeValueHighlight')}</span>
          </div>
          <ul className="space-y-1.5">
            {freeServices.map((service, sIdx) => (
              <li
                key={sIdx}
                className="text-foreground/90 flex items-start gap-1.5 text-[11px] leading-relaxed font-medium sm:text-xs"
              >
                <IconCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border/60 my-4 border-t sm:my-5" />

        {/* Features List */}
        <div>
          <p className="text-foreground/80 pb-2.5 text-xs font-semibold">
            {t('card.includesAll')}
          </p>
          <ul className="space-y-2.5 text-xs sm:space-y-3">
            {features.map((featText, fIdx) => {
              const icon = plan.features[fIdx]?.icon || (
                <IconCheck size={18} stroke={1.5} />
              )
              return (
                <li key={fIdx} className="flex items-start gap-2.5">
                  <div
                    className="text-primary mt-0.5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                    aria-hidden="true"
                  >
                    {icon}
                  </div>
                  <span className="text-foreground/90 text-xs leading-snug sm:text-sm">
                    {featText}
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      </div>

      {/* Action CTA */}
      <div className="pt-6 sm:pt-7">
        {plan.isPopular ? (
          <RainbowButton
            asChild
            className="h-11 w-full text-xs font-bold shadow-md sm:text-sm"
          >
            <Link
              href={contactHref}
              className="flex items-center justify-center gap-2"
            >
              <span>{t('card.ctaButton')}</span>
              <ArrowRight className="size-4" />
            </Link>
          </RainbowButton>
        ) : (
          <Button
            asChild
            className="border-border/80 hover:bg-primary/5 hover:text-primary hover:border-primary/40 h-11 w-full cursor-pointer text-xs font-semibold transition-all sm:text-sm"
            variant="outline"
          >
            <Link
              href={contactHref}
              className="flex items-center justify-center gap-2"
            >
              <span>{t('card.contactCta')}</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
