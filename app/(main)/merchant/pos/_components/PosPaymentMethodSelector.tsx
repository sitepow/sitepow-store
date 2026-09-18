'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { CurrencyCode, PaymentMethod } from '@/generated/prisma/enums'
import {
  IconCash,
  IconCreditCard,
  IconExternalLink,
  IconQrcode,
} from '@tabler/icons-react'

import { cn } from '@/lib/utils'

interface PosPaymentMethodSelectorProps {
  isResellerMode: boolean
  paymentMethod?: PaymentMethod
  isStripeAvailable: boolean
  currency: CurrencyCode
  onSelectMethod: (method: PaymentMethod) => void
}

export function PosPaymentMethodSelector({
  isResellerMode,
  paymentMethod,
  isStripeAvailable,
  currency,
  onSelectMethod,
}: PosPaymentMethodSelectorProps) {
  const t = useTranslations('merchant.pos.checkoutModal')
  const isCash = !isResellerMode && paymentMethod === PaymentMethod.CASH_ON_DELIVERY

  return (
    <div
      className={cn(
        'grid gap-3',
        isResellerMode ? 'grid-cols-1' : 'sm:grid-cols-2',
      )}
    >
      {!isResellerMode && (
        <button
          type="button"
          onClick={() => onSelectMethod(PaymentMethod.CASH_ON_DELIVERY)}
          className={cn(
            'hover:bg-muted/50 relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
            isCash
              ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
              : 'border-border text-muted-foreground',
          )}
        >
          <IconCash className="size-7" />
          <span className="text-sm">{t('cash')}</span>
        </button>
      )}

      {isStripeAvailable ? (
        <button
          type="button"
          onClick={() => onSelectMethod(PaymentMethod.STRIPE_QR_PROMPTPAY)}
          className={cn(
            'hover:bg-muted/50 relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
            paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY
              ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
              : 'border-border text-muted-foreground',
          )}
        >
          {currency === CurrencyCode.THB ? (
            <IconQrcode className="size-7" />
          ) : (
            <IconCreditCard className="size-7" />
          )}
          <span className="text-sm">
            {currency === CurrencyCode.THB
              ? isResellerMode
                ? t('resellerPromptPay')
                : t('promptPay')
              : t('stripeCard')}
          </span>
        </button>
      ) : (
        <div className="border-border text-muted-foreground bg-muted/20 relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-3 text-center">
          {currency === CurrencyCode.THB ? (
            <IconQrcode className="text-muted-foreground/60 size-6" />
          ) : (
            <IconCreditCard className="text-muted-foreground/60 size-6" />
          )}
          <span className="text-xs font-medium">
            {isResellerMode
              ? t('resellerPaymentUnavailable')
              : currency === CurrencyCode.THB
                ? t('promptPayUnavailable')
                : t('stripeCardUnavailable')}
          </span>
          {!isResellerMode && (
            <Link
              href="http://lvh.me:3000/merchant/settings?tab=settings-payment"
              target="_blank"
              className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline"
            >
              {t('setupPayment')}
              <IconExternalLink className="size-3" />
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
