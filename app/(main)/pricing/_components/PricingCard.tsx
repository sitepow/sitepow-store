'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

import { PRICING_VALUE } from '@/constants/pricing'
import { useIsMounted } from '@/hooks/use-is-mounted'
import { useRandomGradient } from '@/hooks/use-random-gradient'
import { PricingPlanProps } from '@/types/pricing'
import { calculatePlanPrice, formatCurrency } from '@/utils/pricing'

import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'

import { usePricingStore } from '../store'

export function PricingCard({
  title,
  description,
  price,
  currency,
  uniqueFeatures,
  buttonText,
  isPopular,
  seed,
}: PricingPlanProps) {
  const t = useTranslations('pricing.card')
  const isMounted = useIsMounted()
  const fallbackGradient = useRandomGradient()
  const selectedTab = usePricingStore((state) => state.selectedTab)

  const {
    basePrice,
    discountPercent,
    totalPriceBeforeDiscount,
    finalPrice,
    averagePerMonth,
  } = calculatePlanPrice(price, selectedTab)

  if (!isMounted) {
    return null
  }

  return (
    <section
      className={`text-foreground dark:bg-foreground/5 flex flex-col items-center rounded-xl border p-2.5 text-start ${
        isPopular && 'text-white shadow-md'
      }`}
      style={{
        backgroundImage: isPopular ? fallbackGradient : '',
      }}
    >
      <Image
        src={`https://api.dicebear.com/9.x/adventurer/svg?seed=${seed}&skinColor=fbd3ad`}
        width={32}
        height={32}
        unoptimized
        alt=""
        className="border-primary mb-2.5 size-32 rounded-full border bg-white"
      />
      <h2 className="text-xl leading-tight font-bold">{title}</h2>
      <p className="max-w-[85%] text-center font-medium opacity-70">
        {description}
      </p>
      <Separator className="my-5 max-w-[75%]" />
      <div className="flex flex-col items-center gap-1">
        {discountPercent > 0 && basePrice > 0 && (
          <span className="text-muted-foreground text-sm line-through">
            {t('from')} {formatCurrency(totalPriceBeforeDiscount)}{' '}
            {currency.split(' ')[0]}
          </span>
        )}
        <div className="flex items-end gap-2">
          <data value={finalPrice} className="text-2xl font-bold">
            {basePrice === 0 ? '0.00' : formatCurrency(finalPrice)}
          </data>
          <span className="mb-0.5 text-sm font-bold">
            {basePrice === 0 ? currency : currency.split(' ')[0]}
          </span>
        </div>
        {basePrice > 0 && selectedTab !== PRICING_VALUE.ONE_MONTH && (
          <span className="text-primary text-xs font-medium">
            {t('averagePerMonth', { price: formatCurrency(averagePerMonth) })}
          </span>
        )}
      </div>
      <Separator className="my-5 max-w-[75%]" />
      <ul className="mt-4 flex w-full grow flex-col gap-2">
        {uniqueFeatures?.map((feature, index) => (
          <li key={index} className="flex items-start gap-2 text-sm">
            <div className="text-primary mt-0.5 shrink-0" aria-hidden="true">
              {feature.icon}
            </div>
            <span>{feature.text}</span>
          </li>
        ))}
      </ul>
      <Button
        className="mt-6 w-full"
        variant={isPopular ? 'default' : 'outline'}
      >
        {buttonText}
      </Button>
    </section>
  )
}
