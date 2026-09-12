'use client'

import { useTranslations } from 'next-intl'

import { ProductType } from '@/generated/prisma/enums'
import { formatCurrency, formatNumber } from '@/utils/pricing'

import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'

import { useProductPurchaseStore } from '../../store'

export function ProductPriceHeader() {
  const t = useTranslations('storefront.products')
  const { product, getCurrentPoints, getTotalPrice, isLoading } =
    useProductPurchaseStore()
  const totalPrice = getTotalPrice()
  const points = getCurrentPoints()
  const isAffiliate = product?.productType === ProductType.AFFILIATE_LINK
  const rawAffiliateLinks = (product?.details as any)?.affiliateLinks
  const affiliateLinks = Array.isArray(rawAffiliateLinks)
    ? rawAffiliateLinks
    : []

  const affiliatePrices = affiliateLinks
    .map((l: any) => l.price)
    .filter((p: any): p is number => typeof p === 'number' && p > 0)

  const minAffiliatePrice =
    affiliatePrices.length > 0 ? Math.min(...affiliatePrices) : totalPrice
  const maxAffiliatePrice =
    affiliatePrices.length > 0 ? Math.max(...affiliatePrices) : totalPrice
  const hasPriceRange =
    isAffiliate &&
    affiliatePrices.length > 1 &&
    minAffiliatePrice !== maxAffiliatePrice

  return (
    <>
      {isLoading ? (
        <Skeleton className="h-10 w-3/4 rounded-lg" />
      ) : (
        <h1 className="text-start text-xl leading-tight font-bold sm:text-2xl lg:text-3xl">
          {product?.title}
        </h1>
      )}

      <div className="flex flex-col gap-2.5">
        {isLoading ? (
          <Skeleton className="h-12 w-36 rounded-lg" />
        ) : (
          <>
            <Label className="text-lg font-semibold">{t('price')}</Label>
            <div className="flex items-end gap-2">
              <data
                value={isAffiliate ? minAffiliatePrice : totalPrice}
                className="text-primary text-4xl font-bold sm:text-5xl"
              >
                {isAffiliate && hasPriceRange
                  ? `${formatCurrency(minAffiliatePrice)} - ${formatCurrency(maxAffiliatePrice)}`
                  : formatCurrency(
                      isAffiliate ? minAffiliatePrice : totalPrice || 0,
                    )}
              </data>
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
