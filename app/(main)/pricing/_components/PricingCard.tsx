'use client'
import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { PRICING_OPTIONS, PRICING_VALUE } from '@/constants/pricing'
import { UserRole } from '@/generated/prisma/enums'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useSession } from '@/hooks/use-session'
import { PricingPlanProps } from '@/types/pricing'
import { calculatePlanPrice } from '@/utils/pricing'

import { BorderBeam } from '@/components/magicui/border-beam'
import { RainbowButton } from '@/components/magicui/rainbow-button'
import { Button } from '@/components/ui/button'

import { usePricingStore } from '../store'

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

  const registerParams = new URLSearchParams()
  registerParams.set('role', UserRole.MERCHANT)
  registerParams.set('callbackUrl', '/merchant/dashboard')
  const registerHref = `/register?${registerParams.toString()}`
  const targetHref = !isAuthenticated
    ? registerHref
    : '/merchant/store-settings'

  const { basePrice, discountPercent, finalPrice, averagePerMonth } =
    calculatePlanPrice(price, selectedTab)

  const currentOption =
    PRICING_OPTIONS.find((opt) => opt.value === selectedTab) ||
    PRICING_OPTIONS[0]
  const currentOptionLabel =
    (t.raw(`tabs.${currentOption.value}`) as string) || currentOption.label

  if (!isMounted) return null

  return (
    <div
      className={`group relative flex flex-col justify-between overflow-visible rounded-3xl p-5 backdrop-blur-md transition-all duration-300 sm:p-6 ${
        isPopular
          ? 'border-primary/80 bg-card/95 ring-primary/25 border-2 shadow-2xl ring-2 lg:-translate-y-3 lg:hover:-translate-y-4'
          : 'border-border/80 bg-card/70 hover:border-border hover:bg-card border shadow-xs hover:-translate-y-2 hover:shadow-xl'
      }`}
    >
      {isPopular && (
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
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-bold tracking-tight sm:text-xl">
            {title}
          </h3>
          {basePrice === 0 && (
            <span className="bg-muted text-muted-foreground rounded-full px-2.5 py-0.5 text-[10px] font-semibold">
              {t('card.freeForever')}
            </span>
          )}
        </div>

        <div className="pt-2 sm:pt-3">
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
              {basePrice === 0 ? t('card.perLifetime') : t('card.perMonth')}
            </span>
          </div>

          {basePrice > 0 && selectedTab !== PRICING_VALUE.ONE_MONTH ? (
            <p className="text-muted-foreground pt-1 text-[11px] font-medium">
              {t('card.totalPayment', {
                price: Math.round(finalPrice).toLocaleString(),
                period: currentOptionLabel,
              })}
            </p>
          ) : (
            <p className="pt-1 text-[11px] text-transparent select-none">-</p>
          )}
        </div>

        <p className="text-muted-foreground min-h-10 pt-2 text-xs leading-relaxed">
          {description}
        </p>

        <div className="border-border/60 my-4 border-t sm:my-5" />

        <ul className="text-foreground space-y-2.5 text-xs sm:space-y-3 sm:text-sm">
          {uniqueFeatures?.map((feature, index) => (
            <li key={index} className="flex items-start gap-2.5">
              <div
                className="text-primary mt-0.5 shrink-0 transition-transform duration-200 group-hover:scale-110"
                aria-hidden="true"
              >
                {feature.icon}
              </div>
              <span className="text-foreground/90 leading-snug">
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="pt-5 sm:pt-6">
        {isPopular ? (
          <RainbowButton
            asChild
            className="h-10 w-full text-xs font-bold shadow-md sm:text-sm"
          >
            <Link href={targetHref}>{buttonText}</Link>
          </RainbowButton>
        ) : (
          <Button
            asChild
            className="border-border/80 hover:bg-primary/5 hover:text-primary hover:border-primary/40 h-10 w-full cursor-pointer text-xs font-semibold transition-all sm:text-sm"
            variant="outline"
          >
            <Link href={targetHref}>{buttonText}</Link>
          </Button>
        )}
      </div>
    </div>
  )
}
