'use client'

import { useEffect, useMemo, useState } from 'react'

import { useTranslations } from 'next-intl'

import { PaymentMethod } from '@/generated/prisma/enums'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import QRCode from 'qrcode'

import { OrderDocComponentProps } from './types'
import { getCustomerInfoFromOrder, getStoreInfoFromOrder } from './utils'

interface ExtendedOrderProps {
  paymentMethod?: string
}

export function ShippingLabelDoc({ order }: OrderDocComponentProps) {
  const t = useTranslations('merchant.pdf')
  const store = getStoreInfoFromOrder(order)
  const customer = getCustomerInfoFromOrder(order)
  const extendedOrder = order as typeof order & ExtendedOrderProps

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  const isCOD =
    order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY ||
    extendedOrder.paymentMethod === 'CASH_ON_DELIVERY'

  const trackingVal = useMemo(
    () => order.trackingNumber || `ORD-${order.orderNumber}`,
    [order.trackingNumber, order.orderNumber],
  )

  const postalCode = useMemo(
    () => customer.shippingAddr?.postalCode || '',
    [customer.shippingAddr?.postalCode],
  )

  useEffect(() => {
    let isMounted = true
    QRCode.toDataURL(trackingVal, {
      margin: 1,
      width: 160,
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrCodeUrl(url)
      })
      .catch((err) => console.error('Error generating shipping QR:', err))

    return () => {
      isMounted = false
    }
  }, [trackingVal])

  return (
    <div className="mx-auto w-full max-w-[105mm] border-2 border-dashed border-neutral-900 bg-white p-4 text-xs leading-normal text-neutral-900 print:m-0 print:w-[100mm] print:border-2 print:border-black print:p-2.5 print:text-black">
      <header className="flex items-start justify-between border-b-2 border-neutral-900 pb-2.5">
        <div>
          <div className="inline-block border border-neutral-900 bg-neutral-950 px-2.5 py-1 text-xs font-bold text-white print:bg-black">
            {order.shippingMethod || t('common.standardDelivery')}
          </div>
          <p className="mt-1.5 text-xs font-semibold text-neutral-950">
            {t('common.orderNumber', { orderNumber: order.orderNumber })}
          </p>
        </div>
        {qrCodeUrl ? (
          <img
            src={qrCodeUrl}
            alt="Tracking QR"
            className="h-16 w-16 object-contain"
          />
        ) : (
          <div className="flex h-16 w-16 items-center justify-center border border-neutral-300 text-[10px] text-neutral-400">
            QR CODE
          </div>
        )}
      </header>
      <section className="mt-2 border border-neutral-300 bg-neutral-50 py-1.5 text-center print:bg-transparent">
        <p className="text-[10px] font-semibold text-neutral-500 uppercase print:text-neutral-700">
          {t('common.trackingNoLabel')}
        </p>
        <p className="text-base font-bold tracking-wider text-neutral-950">
          {order.trackingNumber || `#${order.orderNumber}`}
        </p>
      </section>
      <section className="mt-2.5 border-b border-neutral-300 pb-2 text-[11px]">
        <span className="font-bold text-neutral-500 uppercase print:text-neutral-700">
          {t('shippingLabel.sender')}
        </span>
        <p className="font-semibold text-neutral-950">
          {store.name || t('common.onlineStore')}
        </p>
        {store.phone && (
          <p className="text-neutral-800">
            {t('common.phone', { phone: store.phone })}
          </p>
        )}
        {store.address && (
          <p className="leading-snug text-neutral-700 print:text-neutral-900">
            {store.address}
          </p>
        )}
      </section>
      <section className="mt-2.5 border-2 border-neutral-900 p-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-neutral-950 uppercase">
            {t('shippingLabel.recipient')}
          </span>
          {postalCode && (
            <div className="border border-neutral-900 bg-neutral-950 px-2 py-0.5 text-sm font-bold text-white print:bg-black">
              {postalCode}
            </div>
          )}
        </div>
        <p className="mt-1 text-sm font-bold text-neutral-950">
          {customer.name || t('common.generalCustomer')}
        </p>
        <p className="text-xs font-semibold text-neutral-950">
          {t('common.phone', { phone: customer.phone })}
        </p>
        <p className="mt-1 text-[11px] leading-relaxed text-neutral-900">
          {customer.fullAddress}
        </p>
      </section>
      <section className="mt-2.5">
        {isCOD ? (
          <div className="border-2 border-neutral-900 bg-neutral-100 p-2 text-center print:bg-transparent">
            <p className="text-xs font-bold text-neutral-950 uppercase">
              {t('shippingLabel.cod')}
            </p>
            <p className="text-lg font-bold text-neutral-950">
              {formatCurrency(Number(order.totalAmount))}
            </p>
          </div>
        ) : (
          <div className="border border-neutral-900 p-1.5 text-center">
            <span className="text-xs font-bold text-neutral-950">
              {t('shippingLabel.paid')}
            </span>
          </div>
        )}
      </section>
      <section className="mt-2.5 border-t border-neutral-300 pt-2 text-[10px]">
        <p className="font-semibold text-neutral-600 print:text-neutral-800">
          {t('shippingLabel.itemsInPackage')}
        </p>
        <ul className="mt-0.5 list-inside list-disc space-y-0.5 text-neutral-800 print:text-neutral-900">
          {order.items.slice(0, 4).map((item) => (
            <li key={item.id} className="truncate">
              {item.title} {item.variantTitle && `(${item.variantTitle})`} x
              {item.quantity}
            </li>
          ))}
          {order.items.length > 4 && (
            <li className="list-none pt-0.5 text-neutral-500 print:text-neutral-700">
              {t('shippingLabel.moreItems', { count: order.items.length - 4 })}
            </li>
          )}
        </ul>
      </section>
      <footer className="mt-2 flex items-center justify-between border-t border-neutral-300 pt-1.5 text-[9px] text-neutral-500 print:text-neutral-700">
        <span>
          {t('common.date', { date: formatDateTime(order.createdAt) })}
        </span>
        {order.totalWeight && (
          <span>{t('common.weight', { weight: order.totalWeight })}</span>
        )}
      </footer>
    </div>
  )
}
