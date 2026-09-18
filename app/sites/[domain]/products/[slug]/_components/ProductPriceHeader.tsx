'use client'

import { useLocale, useTranslations } from 'next-intl'

import { CurrencyCode, ProductType } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStorefrontCurrency } from '@/stores/use-currency-store'
import { getLocalizedField } from '@/utils/intl'
import { formatCurrency, formatNumber } from '@/utils/pricing'

import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../store'

interface ProductAffiliateLink {
  price?: number
  url?: string
  platform?: string
  discountText?: string
}

export function ProductPriceHeader() {
  const t = useTranslations('storefront.products')
  const locale = useLocale()
  const { store } = useStoreData()
  const { currentCurrency, convert } = useStorefrontCurrency(
    (store as { baseCurrency?: CurrencyCode } | null)?.baseCurrency,
  )
  const {
    product,
    price,
    selectedVariant,
    getCurrentPoints,
    getTotalPrice,
    isLoading,
  } = useProductPurchaseStore()
  const totalPrice = getTotalPrice()
  const points = getCurrentPoints()
  const isAffiliate = product?.productType === ProductType.AFFILIATE_LINK
  const rawAffiliateLinks = (
    product?.details as { affiliateLinks?: ProductAffiliateLink[] } | null
  )?.affiliateLinks
  const affiliateLinks: ProductAffiliateLink[] = Array.isArray(
    rawAffiliateLinks,
  )
    ? rawAffiliateLinks
    : []

  const affiliatePrices = affiliateLinks
    .map((l) => l.price)
    .filter((p): p is number => typeof p === 'number' && p > 0)

  const fallbackMinAffiliatePrice =
    affiliatePrices.length > 0 ? Math.min(...affiliatePrices) : totalPrice
  const fallbackMaxAffiliatePrice =
    affiliatePrices.length > 0 ? Math.max(...affiliatePrices) : totalPrice

  const affiliateMinPrice = price?.net?.min || fallbackMinAffiliatePrice
  const affiliateMaxPrice = price?.net?.max || fallbackMaxAffiliatePrice
  const hasAffiliatePriceRange =
    isAffiliate && affiliateMinPrice !== affiliateMaxPrice

  const affiliateMinOrigPrice = price?.original?.min || 0
  const affiliateMaxOrigPrice = price?.original?.max || 0
  const hasAffiliateOrigPriceRange =
    affiliateMinOrigPrice !== affiliateMaxOrigPrice
  const hasAffiliateDiscount =
    isAffiliate &&
    Boolean(price?.hasDiscount && affiliateMinOrigPrice > affiliateMinPrice)
  const affiliateDiscountPercent = price?.maxDiscountPercent || 0
  const customDiscountText =
    affiliateLinks[0]?.discountText ||
    (affiliateDiscountPercent > 0 ? `-${affiliateDiscountPercent}%` : null)

  const normalOrigPrice = Number(selectedVariant?.price ?? 0)
  const hasNormalDiscount =
    !isAffiliate &&
    Boolean(selectedVariant?.discountActive && normalOrigPrice > totalPrice)
  const normalDiscountPercent =
    hasNormalDiscount && normalOrigPrice > 0
      ? selectedVariant?.discountType === 'PERCENTAGE'
        ? Number(selectedVariant.discountAmount)
        : Math.round(((normalOrigPrice - totalPrice) / normalOrigPrice) * 100)
      : 0

  const localizedTitle =
    getLocalizedField(product, 'title', locale) || product?.title

  return (
    <>
      {isLoading ? (
        <Skeleton className="h-10 w-3/4 rounded-lg" />
      ) : (
        <h1 className="text-start text-xl leading-tight font-bold sm:text-2xl lg:text-3xl">
          {localizedTitle}
        </h1>
      )}

      <div className="flex flex-col gap-2.5">
        {isLoading ? (
          <Skeleton className="h-12 w-36 rounded-lg" />
        ) : (
          <>
            <Label className="text-lg font-semibold">{t('price')}</Label>
            <div className="flex flex-wrap items-baseline gap-3">
              <data
                value={isAffiliate ? affiliateMinPrice : totalPrice}
                className="text-primary text-4xl font-bold sm:text-5xl"
              >
                {isAffiliate && hasAffiliatePriceRange
                  ? `${formatCurrency(convert(affiliateMinPrice), currentCurrency)} - ${formatCurrency(convert(affiliateMaxPrice), currentCurrency)}`
                  : formatCurrency(
                      convert(
                        isAffiliate ? affiliateMinPrice : totalPrice || 0,
                      ),
                      currentCurrency,
                    )}
              </data>

              {isAffiliate &&
                hasAffiliateDiscount &&
                affiliateMinOrigPrice > 0 && (
                  <span className="text-muted-foreground text-xl font-normal line-through sm:text-2xl">
                    {hasAffiliateOrigPriceRange
                      ? `${formatCurrency(convert(affiliateMinOrigPrice), currentCurrency)} - ${formatCurrency(convert(affiliateMaxOrigPrice), currentCurrency)}`
                      : formatCurrency(
                          convert(affiliateMinOrigPrice),
                          currentCurrency,
                        )}
                  </span>
                )}

              {isAffiliate && hasAffiliateDiscount && customDiscountText && (
                <Badge
                  variant="destructive"
                  className="bg-destructive/10 text-destructive border-0 px-2.5 py-0.5 text-sm font-semibold"
                >
                  {customDiscountText}
                </Badge>
              )}

              {!isAffiliate && hasNormalDiscount && (
                <>
                  <span className="text-muted-foreground text-xl font-normal line-through sm:text-2xl">
                    {formatCurrency(convert(normalOrigPrice), currentCurrency)}
                  </span>
                  {normalDiscountPercent > 0 && (
                    <Badge
                      variant="destructive"
                      className="bg-destructive/10 text-destructive border-0 px-2.5 py-0.5 text-sm font-semibold"
                    >
                      -{normalDiscountPercent}%
                    </Badge>
                  )}
                </>
              )}
            </div>

            {!isAffiliate && points > 0 && (
              <p>
                {t.rich('earnPoints', {
                  points: formatNumber(points),
                  span: (chunks) => (
                    <span className="text-primary text-lg font-bold">
                      {chunks}
                    </span>
                  ),
                })}
              </p>
            )}
          </>
        )}
      </div>

      <Separator />
    </>
  )
}
