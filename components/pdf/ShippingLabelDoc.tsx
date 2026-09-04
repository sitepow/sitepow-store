'use client'

import { useEffect, useState } from 'react'

import { PaymentMethod } from '@/generated/prisma/enums'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import QRCode from 'qrcode'

import { OrderDocComponentProps } from './types'
import { getCustomerInfoFromOrder, getStoreInfoFromOrder } from './utils'

export function ShippingLabelDoc({ order }: OrderDocComponentProps) {
  const store = getStoreInfoFromOrder(order)
  const customer = getCustomerInfoFromOrder(order)

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  const isCOD =
    order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY ||
    (order as any).paymentMethod === PaymentMethod.CASH_ON_DELIVERY

  const trackingVal = order.trackingNumber || `ORD-${order.orderNumber}`

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
      .catch((err) => console.error(err))

    return () => {
      isMounted = false
    }
  }, [trackingVal])

  const postalCode = customer.shippingAddr?.postalCode || ''

  return (
    <div className="mx-auto w-full max-w-105 rounded-lg border-2 border-dashed border-neutral-400 bg-white p-4 text-xs text-black print:m-0 print:max-w-none print:rounded-none print:border-2 print:border-black print:p-3">
      <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-2">
        <div>
          <div className="inline-block rounded bg-black px-2.5 py-0.5 text-sm font-black text-white">
            {order.shippingMethod || 'STANDARD EXPRESS'}
          </div>
          <p className="mt-1 text-xs font-bold text-neutral-800">
            ออเดอร์: #{order.orderNumber}
          </p>
        </div>

        {qrCodeUrl ? (
          <div className="text-center">
            <img
              src={qrCodeUrl}
              alt="QR Tracking"
              className="h-16 w-16 object-contain"
            />
          </div>
        ) : (
          <div className="flex h-16 w-16 items-center justify-center border border-neutral-300 text-[10px] text-neutral-400">
            QR CODE
          </div>
        )}
      </div>
      <div className="mt-2 rounded bg-neutral-100 p-1.5 text-center font-mono text-base font-bold tracking-wider text-neutral-900">
        {order.trackingNumber ? (
          <span>{order.trackingNumber}</span>
        ) : (
          <span className="text-neutral-500">#{order.orderNumber}</span>
        )}
      </div>
      <div className="mt-2.5 border-b border-neutral-300 pb-2">
        <p className="text-[11px] font-bold text-neutral-500 uppercase">
          ผู้ส่ง (FROM):
        </p>
        <p className="text-xs font-bold text-neutral-900">{store.name}</p>
        {store.phone && (
          <p className="font-semibold text-neutral-800">โทร: {store.phone}</p>
        )}
        {store.address && (
          <p className="text-xs leading-snug text-neutral-600">
            {store.address}
          </p>
        )}
      </div>
      <div className="mt-2.5 rounded border border-neutral-900 bg-neutral-50/50 p-2.5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-black tracking-wide text-neutral-900 uppercase">
            ผู้รับ (TO):
          </p>
          {postalCode && (
            <div className="rounded bg-black px-2 py-0.5 font-mono text-base font-black text-white">
              {postalCode}
            </div>
          )}
        </div>
        <p className="mt-1 text-base font-black text-neutral-900">
          {customer.name}
        </p>
        <p className="text-sm font-bold text-neutral-900">
          โทร: {customer.phone}
        </p>
        <p className="mt-1 text-xs leading-relaxed font-medium text-neutral-800">
          {customer.fullAddress}
        </p>
      </div>
      <div className="mt-2.5">
        {isCOD ? (
          <div className="rounded border-2 border-red-600 bg-red-50 p-2 text-center">
            <p className="text-sm font-black text-red-600">
              เก็บเงินปลายทาง (COD)
            </p>
            <p className="text-lg font-black text-red-700">
              {formatCurrency(Number(order.totalAmount))}
            </p>
          </div>
        ) : (
          <div className="rounded border border-emerald-500 bg-emerald-50 p-1.5 text-center">
            <span className="text-xs font-bold text-emerald-800">
              ✓ ชำระเงินแล้ว ไม่ต้องเก็บเงิน (PAID)
            </span>
          </div>
        )}
      </div>
      <div className="mt-2.5 border-t border-neutral-300 pt-2 text-[11px]">
        <p className="font-semibold text-neutral-600">รายการสินค้าในกล่อง:</p>
        <ul className="mt-0.5 list-inside list-disc space-y-0.5 text-neutral-700">
          {order.items.slice(0, 4).map((item) => (
            <li key={item.id} className="truncate">
              {item.title} {item.variantTitle ? `(${item.variantTitle})` : ''} x
              {item.quantity}
            </li>
          ))}
          {order.items.length > 4 && (
            <li className="text-neutral-500">
              และอื่นๆ อีก {order.items.length - 4} รายการ
            </li>
          )}
        </ul>
      </div>
      <div className="mt-2 flex items-center justify-between border-t border-neutral-200 pt-1.5 text-[10px] text-neutral-400">
        <span>วันที่สั่งซื้อ: {formatDateTime(order.createdAt)}</span>
        {order.totalWeight && <span>น้ำหนัก: {order.totalWeight} กก.</span>}
      </div>
    </div>
  )
}
