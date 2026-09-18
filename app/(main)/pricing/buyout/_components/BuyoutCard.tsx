'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { type BuyoutPlan } from '@/constants/buyout'
import { useIsMounted } from '@/hooks/use-is-mounted'
import {
  IconCheck,
  IconGift,
  IconHeadset,
  IconServer,
} from '@tabler/icons-react'
import { ArrowRight } from 'lucide-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

interface BuyoutCardProps {
  plan: BuyoutPlan
  planIndex: number
}

export function BuyoutCard({ plan, planIndex }: BuyoutCardProps) {
  const isMounted = useIsMounted()
  const t = useTranslations('buyout')

  const planData = useMemo(() => {
    const getRaw = <T,>(key: string, fallback: T): T => {
      try {
        const val = t.raw(`plans.${planIndex}.${key}`)
        return (val as T) ?? fallback
      } catch {
        return fallback
      }
    }

    return {
      title: getRaw('title', plan.title),
      subtitle: getRaw('subtitle', plan.subtitle),
      description: getRaw('description', plan.description),
      price: getRaw('price', plan.price),
      originalPrice: getRaw('originalPrice', plan.originalPrice),
      features: getRaw(
        'features',
        plan.features.map((f) => f.text),
      ),
      freeServices: getRaw('freeServices', plan.freeServices),
    }
  }, [t, plan, planIndex])

  if (!isMounted) {
    return null
  }

  const contactHref = `/contact?subject=${encodeURIComponent(
    `สนใจซื้อระบบขาด แพ็กเกจ ${planData.title}`,
  )}`

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-visible rounded-3xl p-5 backdrop-blur-md transition-all duration-300 sm:p-6.5',
        plan.isPopular
          ? 'border-primary/80 bg-card/95 ring-primary/25 border-2 shadow-2xl ring-2 lg:-translate-y-3 lg:hover:-translate-y-4'
          : 'border-border/80 bg-card/70 hover:border-border hover:bg-card border shadow-xs hover:-translate-y-2 hover:shadow-xl',
      )}
    >
      {plan.isPopular && <PopularEffects label={t('card.popularBadge')} />}

      <div>
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-foreground text-xl font-bold tracking-tight sm:text-2xl">
              {planData.title}
            </h3>
            <p className="text-primary pt-0.5 text-xs font-semibold">
              {planData.subtitle}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge icon={<IconServer className="size-3" />} color="emerald">
              {t('card.freeInstallBadge')}
            </Badge>
            <Badge icon={<IconHeadset className="size-3" />} color="blue">
              {t('card.freeSupportBadge')}
            </Badge>
          </div>
        </div>

        <div className="pt-3 sm:pt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-muted-foreground text-xs line-through opacity-80">
              {t('card.originalPrice', { price: planData.originalPrice })}
            </span>
            <span className="rounded-md bg-rose-500/15 px-1.5 py-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400">
              {t('card.saveAmount', { amount: plan.saveAmount })}
            </span>
          </div>

          <div className="flex items-baseline gap-1.5 pt-1">
            <span className="text-foreground text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              ฿{planData.price}
            </span>
            <span className="text-muted-foreground text-xs font-semibold">
              / {t('card.oneTimePayment')}
            </span>
          </div>

          <p className="pt-1.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
            ✓ {plan.breakEvenNote}
          </p>
        </div>

        <p className="text-muted-foreground min-h-9 pt-2.5 text-xs leading-relaxed">
          {planData.description}
        </p>

        <div className="border-primary/25 bg-primary/5 mt-4 rounded-2xl border p-3 sm:p-3.5">
          <div className="text-primary flex items-center gap-1.5 pb-2 text-xs font-bold">
            <IconGift className="size-4 shrink-0" />
            <span>{t('card.freeValueHighlight')}</span>
          </div>
          <ul className="space-y-1.5">
            {planData.freeServices.map((service, idx) => (
              <li
                key={idx}
                className="text-foreground/90 flex items-start gap-1.5 text-[11px] leading-relaxed font-medium sm:text-xs"
              >
                <IconCheck className="mt-0.5 size-3.5 shrink-0 text-emerald-500" />
                <span>{service}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-border/60 my-4 border-t sm:my-5" />

        <div>
          <p className="text-foreground/80 pb-2.5 text-xs font-semibold">
            {t('card.includesAll')}
          </p>
          <ul className="space-y-2.5 text-xs sm:space-y-3">
            {planData.features.map((featText, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <span
                  className="text-primary mt-0.5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                  aria-hidden="true"
                >
                  {plan.features[idx]?.icon ?? (
                    <IconCheck size={18} stroke={1.5} />
                  )}
                </span>
                <span className="text-foreground/90 text-xs leading-snug sm:text-sm">
                  {featText}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="pt-6 sm:pt-7">
        <BuyoutActionButton
          isPopular={plan.isPopular}
          href={contactHref}
          label={plan.isPopular ? t('card.ctaButton') : t('card.contactCta')}
        />
      </div>
    </div>
  )
}

function Badge({
  children,
  icon,
  color,
}: {
  children: React.ReactNode
  icon: React.ReactNode
  color: 'emerald' | 'blue'
}) {
  const colorStyles = {
    emerald: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  }

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold',
        colorStyles[color],
      )}
    >
      {icon}
      {children}
    </span>
  )
}

function PopularEffects({ label }: { label: string }) {
  return (
    <>
      <div className="bg-primary text-primary-foreground absolute -top-3.5 left-1/2 z-20 -translate-x-1/2 rounded-full px-4 py-1 text-xs font-bold shadow-md">
        {label}
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
  )
}

function BuyoutActionButton({
  isPopular,
  href,
  label,
}: {
  isPopular?: boolean
  href: string
  label: string
}) {
  const content = (
    <span className="flex items-center justify-center gap-2">
      <span>{label}</span>
      <ArrowRight className="size-4" />
    </span>
  )

  if (isPopular) {
    return (
      <RainbowButton
        asChild
        className="h-11 w-full text-xs font-bold shadow-md sm:text-sm"
      >
        <Link href={href}>{content}</Link>
      </RainbowButton>
    )
  }

  return (
    <Button
      asChild
      variant="outline"
      className="border-border/80 hover:bg-primary/5 hover:text-primary hover:border-primary/40 h-11 w-full cursor-pointer text-xs font-semibold transition-all sm:text-sm"
    >
      <Link href={href}>{content}</Link>
    </Button>
  )
}
