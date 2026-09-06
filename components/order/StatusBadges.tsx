'use client'

import { useLocale, useTranslations } from 'next-intl'

import {
  ORDER_STATUS_EN,
  ORDER_STATUS_TH,
  PAYMENT_METHOD_EN,
  PAYMENT_METHOD_TH,
} from '@/constants/translate'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
import { formatDateTime } from '@/utils/date'

import { Badge } from '@/components/ui/badge'

interface OrderStatusBadgesProps {
  status: OrderStatus
  paymentMethod?: PaymentMethod | null
  paidAt?: Date | string | null
  isTaxInvoiceRequested?: boolean | null
}

export function OrderStatusBadges({
  status,
  paymentMethod,
  paidAt,
  isTaxInvoiceRequested,
}: OrderStatusBadgesProps) {
  const t = useTranslations('common.order')
  const locale = useLocale()

  const tr = (key: string, fallback: string) => {
    try {
      if (t.has(key as any)) {
        return t(key as any)
      }
    } catch {}
    return fallback
  }

  const isPaidOrShipped =
    status === OrderStatus.PAID || status === OrderStatus.SHIPPED

  const statusLabel = tr(
    `statuses.${status}`,
    locale === 'en'
      ? (ORDER_STATUS_EN[status] ?? status)
      : (ORDER_STATUS_TH[status] ?? status),
  )

  const paymentMethodLabel = paymentMethod
    ? tr(
        `paymentMethods.${paymentMethod}`,
        locale === 'en'
          ? (PAYMENT_METHOD_EN[paymentMethod] ?? paymentMethod)
          : (PAYMENT_METHOD_TH[paymentMethod] ?? paymentMethod),
      )
    : null

  return (
    <div className="mb-3 flex flex-wrap gap-2">
      {isTaxInvoiceRequested && (
        <Badge>{tr('taxInvoiceRequested', 'ขอใบกำกับภาษี')}</Badge>
      )}
      <Badge variant={isPaidOrShipped ? 'default' : 'outline'}>
        {tr('statusLabel', 'สถานะออเดอร์')}: {statusLabel}
      </Badge>
      {paymentMethod && (
        <Badge variant="outline">
          {tr('paymentLabel', 'รูปแบบชำระเงิน')}: {paymentMethodLabel}
        </Badge>
      )}
      {paidAt && (
        <Badge variant="secondary">
          {tr('paidAt', 'ชำระเงินเมื่อ')}: {formatDateTime(paidAt)}
        </Badge>
      )}
    </div>
  )
}
