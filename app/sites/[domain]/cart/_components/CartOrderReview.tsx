'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import type { CartSummary as CartSummaryType } from '@/types/sites/cart'
import { IconLock } from '@tabler/icons-react'

import { HighlightText } from '@/components/HighlightText'
import { Button } from '@/components/ui/button'

import { CartSummary } from '../../_components/cart/_components/CartSummary'
import { SummaryRow } from '../../_components/cart/_components/SummaryRow'
import { SummaryTotal } from '../../_components/cart/_components/SummaryTotal'
import { DiscountForm } from './DiscountForm'

interface CartOrderReviewProps {
  primaryColor?: string | null
  summary: CartSummaryType
  shippingFee: number
  grandTotal: number
  pointsDiscount: number
  couponDiscount: number
  appliedCoupon?: { code: string } | null
  currentCurrency?: string
  formatCurrency: (amount: number, currency?: string) => string
  convert: (amount: number) => number
  isAuthenticated: boolean
  isEmailUnverified: boolean
  loginHref: string
  canPlaceOrder: boolean
  isSubmitting: boolean
  onPlaceOrder: () => void
}

export function CartOrderReview({
  primaryColor,
  summary,
  shippingFee,
  grandTotal,
  pointsDiscount,
  couponDiscount,
  appliedCoupon,
  currentCurrency,
  formatCurrency,
  convert,
  isAuthenticated,
  isEmailUnverified,
  loginHref,
  canPlaceOrder,
  isSubmitting,
  onPlaceOrder,
}: CartOrderReviewProps) {
  const t = useTranslations('storefront.cart')

  return (
    <div
      style={
        primaryColor
          ? ({ '--primary': primaryColor } as React.CSSProperties)
          : undefined
      }
      className="border-border relative overflow-hidden rounded-xl border p-5"
    >
      <div className="relative z-10">
        <SummaryRow
          className="mb-5"
          label={t('discount')}
          value={<DiscountForm subtotal={summary.finalPrice} />}
        />
        <SummaryRow
          label={t('totalShippingFee')}
          value={formatCurrency(convert(shippingFee), currentCurrency)}
        />
        <div>
          <CartSummary summary={summary} />
        </div>

        {(pointsDiscount > 0 || couponDiscount > 0) && (
          <div className="border-border mt-2 space-y-1 border-t pt-2">
            {pointsDiscount > 0 && (
              <SummaryRow
                label={t('pointsDiscountLabel')}
                value={
                  <HighlightText>
                    - {formatCurrency(convert(pointsDiscount), currentCurrency)}
                  </HighlightText>
                }
              />
            )}
            {couponDiscount > 0 && (
              <SummaryRow
                label={t('couponDiscountCode', {
                  code: appliedCoupon?.code ?? '',
                })}
                value={
                  <HighlightText>
                    - {formatCurrency(convert(couponDiscount), currentCurrency)}
                  </HighlightText>
                }
              />
            )}
          </div>
        )}

        <div className="border-border mt-4 border-t pt-2">
          <SummaryTotal
            label={t('orderTotal')}
            value={formatCurrency(convert(grandTotal), currentCurrency)}
          />
        </div>

        {isAuthenticated ? (
          <Button
            className="mt-6 h-12 w-full text-lg font-bold shadow-md transition-transform hover:scale-[1.01]"
            size="lg"
            disabled={!canPlaceOrder || isSubmitting || isEmailUnverified}
            onClick={onPlaceOrder}
          >
            {isSubmitting ? t('processingOrderBtn') : t('placeOrderAction')}
          </Button>
        ) : (
          <Button
            className="mt-6 h-12 w-full text-lg font-bold shadow-md"
            size="lg"
            asChild
          >
            <Link href={loginHref}>
              {t('loginToOrder')} <IconLock className="ml-1 size-5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
