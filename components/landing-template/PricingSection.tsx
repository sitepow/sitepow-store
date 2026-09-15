'use client'
import { useRef, useState } from 'react'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { MainSectionHeader } from '@/app/(main)/_components/MainSectionHeader'
import {
  PRICING_OPTIONS,
  PRICING_PLANS,
  PRICING_VALUE,
} from '@/constants/pricing'
import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import { calculatePlanPrice } from '@/utils/pricing'
import { useGSAP } from '@gsap/react'
import { IconServer } from '@tabler/icons-react'
import { ArrowRight } from 'lucide-react'

import { BorderBeam } from '@/components/magicui/border-beam'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'
import { Card, CardFooter, CardHeader } from '@/components/ui/card'

import { ScrollTrigger, gsap } from '@/lib/gsap'
import { getManageUrl } from '@/lib/manage-url'

export interface PricingSectionProps {
  badge?: string
  title?: string
  description?: string
  compareLink?: string
}

export function PricingSection({
  badge,
  title,
  description,
  compareLink,
}: PricingSectionProps = {}) {
  const isMounted = useIsMounted()
  const [selectedPeriod, setSelectedPeriod] = useState<string>(
    PRICING_VALUE.TWELVE_MONTHS,
  )
  const { isAuthenticated } = useSession()
  const isAuth = isMounted && isAuthenticated
  const t = useTranslations('pricing')
  const tHome = useTranslations('home.pricing')

  const resolvedBadge = badge ?? tHome('badge')
  const resolvedTitle = title ?? tHome('title')
  const resolvedDescription = description ?? tHome('description')
  const resolvedCompareLink = compareLink ?? tHome('compareLink')

  const sectionRef = useRef<HTMLElement>(null)
  const headerRef = useRef<HTMLDivElement>(null)
  const cardsRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
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
        gsap.fromTo(
          cards,
          { y: 50, scale: 0.94, opacity: 0 },
          {
            y: 0,
            scale: 1,
            opacity: 1,
            duration: 0.85,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: cardsRef.current,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          },
        )
      }

      ScrollTrigger.refresh()
    },
    { scope: sectionRef },
  )

  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', getManageUrl('/merchant/dashboard'))
  const registerHref = `/register?${registerParams.toString()}`

  const plans = PRICING_PLANS.map((plan, idx) => {
    let title = plan.title
    let description = plan.description
    let buttonText = plan.buttonText
    let uniqueFeatures = plan.uniqueFeatures
    try {
      title = (t.raw(`plans.${idx}.title`) as string) || plan.title
      description =
        (t.raw(`plans.${idx}.description`) as string) || plan.description
      buttonText =
        (t.raw(`plans.${idx}.buttonText`) as string) || plan.buttonText
      uniqueFeatures = plan.uniqueFeatures.map((feature, fIdx) => ({
        ...feature,
        text:
          (t.raw(`plans.${idx}.features.${fIdx}`) as string) || feature.text,
      }))
    } catch {}
    return {
      ...plan,
      title,
      description,
      buttonText,
      uniqueFeatures,
    }
  })

  const currentOption =
    PRICING_OPTIONS.find((opt) => opt.value === selectedPeriod) ||
    PRICING_OPTIONS[0]
  const currentOptionLabel =
    (t.raw(`tabs.${currentOption.value}`) as string) || currentOption.label

  return (
    <section
      ref={sectionRef}
      id="pricing"
      className="relative w-full overflow-hidden py-16 md:py-24"
    >
      {/* Background Soft Glows */}
      <div
        aria-hidden="true"
        className="from-primary/20 pointer-events-none absolute top-1/3 left-1/2 -z-10 h-96 w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr via-orange-500/10 to-transparent blur-[120px]"
      />

      <div className="mx-auto w-full max-w-7xl space-y-8 px-4 sm:space-y-12 sm:px-6 lg:px-8">
        {/* Header + Billing Switcher */}
        <div ref={headerRef} className="space-y-4 text-center">
          <MainSectionHeader
            badge={resolvedBadge}
            title={resolvedTitle}
            description={resolvedDescription}
          />

          <div className="flex justify-center pt-2">
            <div className="bg-muted/80 border-border/80 relative inline-flex max-w-full flex-wrap items-center justify-center gap-1 rounded-2xl border p-1.5 shadow-inner backdrop-blur-md">
              {PRICING_OPTIONS.map((opt) => {
                const isSelected = selectedPeriod === opt.value
                const label =
                  (t.raw(`tabs.${opt.value}`) as string) || opt.label
                return (
                  <button
                    key={opt.value}
                    onClick={() => setSelectedPeriod(opt.value)}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all duration-300 sm:px-4 ${
                      isSelected
                        ? 'bg-background text-foreground shadow-sm ring-1 ring-black/5 dark:ring-white/10'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{label}</span>
                    {(opt.discountPercent ?? 0) > 0 && (
                      <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        {t('tabs.discountBadge', {
                          percent: opt.discountPercent ?? 0,
                        })}
                      </span>
                    )}
                  </button>
                )
              })}
              <Link
                href="/pricing/buyout"
                className="text-muted-foreground hover:text-primary border-border/40 hover:border-primary/40 flex cursor-pointer items-center gap-1.5 rounded-xl border border-dashed px-3 py-1.5 text-xs font-semibold transition-all duration-300 sm:px-3.5"
              >
                <span>{tHome('buyoutCalloutBtn')}</span>
                <span className="rounded-full bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                  Hot
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div
          ref={cardsRef}
          className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-2 lg:grid-cols-4"
        >
          {plans.map((plan, idx) => {
            const { basePrice, discountPercent, finalPrice, averagePerMonth } =
              calculatePlanPrice(plan.price, selectedPeriod)
            const targetHref = !isAuth
              ? registerHref
              : '/merchant/store-settings'

            return (
              <Card
                key={idx}
                className={`group relative flex flex-col justify-between overflow-visible rounded-3xl p-5 backdrop-blur-md transition-all duration-300 sm:p-6 ${
                  plan.isPopular
                    ? 'border-primary/80 bg-card/95 ring-primary/20 border-2 shadow-2xl ring-2 lg:-translate-y-3 lg:hover:-translate-y-4'
                    : 'border-border/80 bg-card/70 hover:border-border hover:bg-card border shadow-xs hover:-translate-y-2 hover:shadow-xl'
                }`}
              >
                {/* Popular Badge & BorderBeam Effect */}
                {plan.isPopular && (
                  <>
                    <div className="bg-primary text-primary-foreground absolute -top-3.5 left-1/2 z-20 -translate-x-1/2 rounded-full px-3.5 py-0.5 text-xs font-bold shadow-md">
                      {t('card.mostPopular')}
                    </div>
                    <BorderBeam
                      size={160}
                      duration={7}
                      colorFrom="#f97316"
                      colorTo="#3b82f6"
                      borderWidth={2}
                    />
                  </>
                )}

                <div>
                  <CardHeader className="space-y-2 p-0">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground text-xl font-bold tracking-tight">
                        {plan.title}
                      </span>
                      {basePrice === 0 && (
                        <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
                          {t('card.freeForever')}
                        </span>
                      )}
                    </div>

                    <div className="pt-2">
                      {discountPercent > 0 && basePrice > 0 ? (
                        <span className="text-muted-foreground text-xs line-through opacity-80">
                          ฿{basePrice.toLocaleString()} {t('card.perMonth')}
                        </span>
                      ) : (
                        <div className="h-4" />
                      )}

                      <div className="flex items-baseline gap-1">
                        <span className="text-foreground text-3xl font-black tracking-tight transition-all duration-300 sm:text-4xl">
                          {basePrice === 0
                            ? '฿0'
                            : `฿${Math.round(averagePerMonth).toLocaleString()}`}
                        </span>
                        <span className="text-muted-foreground text-xs font-medium">
                          {basePrice === 0
                            ? t('card.perLifetime')
                            : t('card.perMonth')}
                        </span>
                      </div>

                      {basePrice > 0 &&
                      selectedPeriod !== PRICING_VALUE.ONE_MONTH ? (
                        <p className="text-muted-foreground pt-1 text-[11px] font-medium">
                          {t('card.totalPayment', {
                            price: Math.round(finalPrice).toLocaleString(),
                            period: currentOptionLabel,
                          })}
                        </p>
                      ) : (
                        <p className="pt-1 text-[11px] text-transparent select-none">
                          -
                        </p>
                      )}
                    </div>

                    <p className="text-muted-foreground min-h-10 pt-2 text-xs leading-relaxed">
                      {plan.description}
                    </p>
                  </CardHeader>

                  <div className="border-border/60 my-5 border-t" />

                  <ul className="text-foreground space-y-3 text-xs sm:text-sm">
                    {plan.uniqueFeatures.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2.5">
                        <div
                          className="text-primary mt-0.5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                          aria-hidden="true"
                        >
                          {feat.icon}
                        </div>
                        <span className="text-foreground/90 text-xs leading-snug sm:text-sm">
                          {feat.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <CardFooter className="p-0 pt-6">
                  {plan.isPopular ? (
                    <RainbowButton
                      asChild
                      className="h-10 w-full text-xs font-bold shadow-md sm:text-sm"
                    >
                      <Link href={targetHref}>{plan.buttonText}</Link>
                    </RainbowButton>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      className="border-border/80 hover:bg-primary/5 hover:text-primary hover:border-primary/40 h-10 w-full cursor-pointer text-xs font-semibold transition-all sm:text-sm"
                    >
                      <Link href={targetHref}>{plan.buttonText}</Link>
                    </Button>
                  )}
                </CardFooter>
              </Card>
            )
          })}
        </div>

        {/* Buyout Callout Banner */}
        <div className="border-primary/30 bg-card/70 hover:border-primary/50 relative overflow-hidden rounded-3xl border p-5 shadow-sm backdrop-blur-md transition-all sm:p-6">
          <div className="flex flex-col items-center justify-between gap-4 text-center sm:flex-row sm:text-left">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                <span className="bg-primary text-primary-foreground inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold">
                  <IconServer className="size-3" />
                  Lifetime License
                </span>
                <span className="text-foreground text-sm font-bold sm:text-base">
                  {tHome('buyoutCallout')}
                </span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed sm:text-sm">
                {tHome('buyoutCalloutDesc')}
              </p>
            </div>
            <Button
              asChild
              className="bg-primary hover:bg-primary/90 text-primary-foreground shrink-0 rounded-xl px-5 text-xs font-semibold shadow-sm sm:text-sm"
            >
              <Link
                href="/pricing/buyout"
                className="flex items-center gap-1.5"
              >
                <span>{tHome('buyoutCalloutBtn')}</span>
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        {/* Compare All Features Link */}
        <div className="pt-2 text-center">
          <Link
            href="/pricing"
            className="text-muted-foreground hover:text-primary group inline-flex items-center gap-1.5 text-sm font-medium transition-colors"
          >
            <span>{resolvedCompareLink}</span>
            <ArrowRight className="size-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  )
}
