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
      className={`relative flex flex-col justify-between rounded-2xl p-4 transition-all duration-300 sm:rounded-3xl sm:p-6 ${
        isPopular
          ? 'border-primary bg-card/90 ring-primary/20 border-2 shadow-xl ring-1 lg:-translate-y-2'
          : 'border-border/80 bg-card/60 hover:border-border border hover:shadow-md'
      }`}
    >
      {isPopular && (
        <>
          <div className="bg-primary text-primary-foreground absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-2.5 py-0.5 text-[11px] font-semibold shadow-sm sm:-top-3.5 sm:px-3 sm:text-xs">
            {t('card.mostPopular')}
          </div>
          <BorderBeam
            size={160}
            duration={8}
            colorFrom="#f97316"
            colorTo="#3b82f6"
            borderWidth={2}
          />
        </>
      )}
      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-foreground text-lg font-bold sm:text-xl">
            {title}
          </h3>
          {basePrice === 0 && (
            <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-[10px] font-medium">
              {t('card.freeForever')}
            </span>
          )}
        </div>
        <div className="pt-2 sm:pt-3">
          {discountPercent > 0 && basePrice > 0 && (
            <span className="text-muted-foreground text-xs line-through">
              ฿{basePrice.toLocaleString()} {t('card.perMonth')}
            </span>
          )}
          <div className="flex items-baseline gap-1">
            <span className="text-foreground text-2xl font-extrabold sm:text-4xl">
              {basePrice === 0
                ? '฿0'
                : `฿${Math.round(averagePerMonth).toLocaleString()}`}
            </span>
            <span className="text-muted-foreground text-xs font-medium">
              {basePrice === 0 ? t('card.perLifetime') : t('card.perMonth')}
            </span>
          </div>
          {basePrice > 0 && selectedTab !== PRICING_VALUE.ONE_MONTH && (
            <p className="text-muted-foreground pt-0.5 text-[11px]">
              {t('card.totalPayment', {
                price: Math.round(finalPrice).toLocaleString(),
                period: currentOptionLabel,
              })}
            </p>
          )}
        </div>
        <p className="text-muted-foreground min-h-auto pt-2 text-xs leading-relaxed sm:min-h-9 sm:pt-3">
          {description}
        </p>
        <div className="border-border/60 my-3.5 border-t sm:my-5" />
        <ul className="text-foreground space-y-2 text-xs sm:space-y-3 sm:text-sm">
          {uniqueFeatures?.map((feature, index) => (
            <li key={index} className="flex items-start gap-2 sm:gap-2.5">
              <div className="text-primary mt-0.5 shrink-0" aria-hidden="true">
                {feature.icon}
              </div>
              <span className="leading-snug">{feature.text}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="pt-4 sm:pt-6">
        <Button
          asChild
          className="h-9 w-full cursor-pointer text-xs font-semibold sm:h-10 sm:text-sm"
          variant={isPopular ? 'default' : 'outline'}
        >
          <Link href={targetHref}>{buttonText}</Link>
        </Button>
      </div>
    </div>
  )
}
