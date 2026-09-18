'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { PRICING_OPTIONS, PRICING_VALUE } from '@/constants/pricing'
import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import { type PricingPlanProps } from '@/types/pricing'
import { calculatePlanPrice } from '@/utils/pricing'

import { BorderBeam } from '@/components/magicui/border-beam'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'

import { cn } from '@/lib/utils'

import { usePricingStore } from '../store'

const REGISTER_HREF = `/register?role=${UserRole.MERCHANT}&callbackUrl=%2Fmerchant%2Fdashboard`

export function PricingCard({
  title,
  description,
  price,
  uniqueFeatures,
  buttonText,
  isPopular,
}: PricingPlanProps) {
  const isMounted = useIsMounted()
  const { isAuthenticated } = useSession()
  const t = useTranslations('pricing')
  const selectedTab = usePricingStore((state) => state.selectedTab)

  const targetHref = isAuthenticated
    ? '/merchant/store-settings'
    : REGISTER_HREF

  const { basePrice, discountPercent, finalPrice, averagePerMonth } =
    calculatePlanPrice(price, selectedTab)

  const currentOption =
    PRICING_OPTIONS.find((opt) => opt.value === selectedTab) ??
    PRICING_OPTIONS[0]
  const currentOptionLabel =
    (t.raw(`tabs.${currentOption.value}`) as string) || currentOption.label

  const isFree = basePrice === 0
  const hasDiscount = discountPercent > 0 && !isFree
  const showTotalPrice = !isFree && selectedTab !== PRICING_VALUE.ONE_MONTH

  if (!isMounted) {
    return null
  }

  return (
    <div
      className={cn(
        'group relative flex flex-col justify-between overflow-visible rounded-3xl p-5 backdrop-blur-md transition-all duration-300 sm:p-6',
        isPopular
          ? 'border-primary/80 bg-card/95 ring-primary/25 border-2 shadow-2xl ring-2 lg:-translate-y-3 lg:hover:-translate-y-4'
          : 'border-border/80 bg-card/70 hover:border-border hover:bg-card border shadow-xs hover:-translate-y-2 hover:shadow-xl',
      )}
    >
      {isPopular && <PopularBeams label={t('card.mostPopular')} />}

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-bold tracking-tight sm:text-xl">
            {title}
          </h3>
          {isFree && (
            <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              {t('card.freeForever')}
            </span>
          )}
        </div>

        <div className="pt-2 sm:pt-3">
          <div className="h-4">
            {hasDiscount && (
              <span className="text-muted-foreground text-xs line-through opacity-80">
                ฿{basePrice.toLocaleString()} {t('card.perMonth')}
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-1">
            <span className="text-foreground text-3xl font-black tracking-tight transition-all duration-300 sm:text-4xl">
              {isFree
                ? '฿0'
                : `฿${Math.round(averagePerMonth).toLocaleString()}`}
            </span>
            <span className="text-muted-foreground text-xs font-medium">
              {isFree ? t('card.perLifetime') : t('card.perMonth')}
            </span>
          </div>

          <div className="h-5 pt-1">
            {showTotalPrice && (
              <p className="text-muted-foreground text-[11px] font-medium">
                {t('card.totalPayment', {
                  price: Math.round(finalPrice).toLocaleString(),
                  period: currentOptionLabel,
                })}
              </p>
            )}
          </div>
        </div>

        <p className="text-muted-foreground min-h-10 pt-2 text-xs leading-relaxed">
          {description}
        </p>

        <div className="border-border/60 my-4 border-t sm:my-5" />

        <ul className="text-foreground space-y-2.5 text-xs sm:space-y-3 sm:text-sm">
          {uniqueFeatures?.map((feature, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <span
                className="text-primary mt-0.5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                {feature.icon}
              </span>
              <span className="text-foreground/90 leading-snug">
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-5 sm:pt-6">
        <PricingActionButton
          isPopular={isPopular}
          href={targetHref}
          label={buttonText}
        />
      </div>
    </div>
  )
}

function PopularBeams({ label }: { label: string }) {
  return (
    <>
      <div className="bg-primary text-primary-foreground absolute -top-3.5 left-1/2 z-20 -translate-x-1/2 rounded-full px-3.5 py-0.5 text-xs font-bold shadow-md">
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

function PricingActionButton({
  isPopular,
  href,
  label,
}: {
  isPopular?: boolean
  href: string
  label: string
}) {
  if (isPopular) {
    return (
      <RainbowButton
        asChild
        className="h-10 w-full text-xs font-bold shadow-md sm:text-sm"
      >
        <Link href={href}>{label}</Link>
      </RainbowButton>
    )
  }

  return (
    <Button
      asChild
      variant="outline"
      className="border-border/80 hover:bg-primary/5 hover:text-primary hover:border-primary/40 h-10 w-full cursor-pointer text-xs font-semibold transition-all sm:text-sm"
    >
      <Link href={href}>{label}</Link>
    </Button>
  )
}
