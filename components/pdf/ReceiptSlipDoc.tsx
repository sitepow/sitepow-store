'use client'

import { useEffect, useMemo, useState } from 'react'

import { PAYMENT_METHOD_TH } from '@/constants/translate'
import { PaymentMethod } from '@/generated/prisma/enums'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import QRCode from 'qrcode'

import { OrderDocComponentProps } from './types'
import { getCustomerInfoFromOrder, getStoreInfoFromOrder } from './utils'

interface ExtendedOrderProps {
  employee?: { name?: string }
  receivedAmount?: number | string
  changeAmount?: number | string
  paymentMethod?: string
}

export function ReceiptSlipDoc({ order }: OrderDocComponentProps) {
  const store = getStoreInfoFromOrder(order)
  const customer = getCustomerInfoFromOrder(order)
  const extendedOrder = order as typeof order & ExtendedOrderProps

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  const itemsSubtotal = useMemo(
    () =>
      order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      ),
    [order.items],
  )

  const totalAmount = Number(order.totalAmount || 0)
  const totalQuantity = useMemo(
    () => order.items.reduce((sum, item) => sum + item.quantity, 0),
    [order.items],
  )

  const vatAmount = useMemo(
    () => totalAmount - totalAmount / 1.07,
    [totalAmount],
  )

  const pointsDiscount = Number(order.pointsDiscount || 0)
  const couponDiscount = Number(order.coupon?.discountAmount || 0)
  const shippingFee = Number(order.shippingFee || 0)
  const earnedPoints = Number(order.earnedPoints || 0)

  const isCash = order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY

  const paymentLabel = useMemo(() => {
    if (!order.paymentMethod) return 'เงินสด'
    return (
      (PAYMENT_METHOD_TH as Record<string, string>)[order.paymentMethod] ||
      order.paymentMethod
    )
  }, [order.paymentMethod])

  useEffect(() => {
    let isMounted = true
    QRCode.toDataURL(`ORD-${order.orderNumber}`, {
      margin: 0,
      width: 130,
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        if (isMounted) setQrCodeUrl(url)
      })
      .catch((err) => console.error('Error generating slip QR:', err))

    return () => {
      isMounted = false
    }
  }, [order.orderNumber])

  return (
    <div className="mx-auto w-full max-w-[80mm] bg-white px-3 py-4 text-[11px] leading-tight text-neutral-900 print:m-0 print:w-[76mm] print:p-0 print:text-black">
      <header className="text-center">
        {store.logo && (
          <img
            src={store.logo}
            alt={store.name}
            className="mx-auto mb-2 h-12 w-12 object-contain"
          />
        )}
        <h1 className="text-sm font-bold tracking-tight text-neutral-950">
          {store.name}
        </h1>
        {order.items[0]?.branch?.name && (
          <p className="mt-0.5 text-[10px] text-neutral-600 print:text-neutral-800">
            สาขา: {order.items[0].branch.name}
          </p>
        )}
        {store.address && (
          <p className="mt-0.5 text-[10px] leading-snug text-neutral-600 print:text-neutral-800">
            {store.address}
          </p>
        )}
        <div className="mt-0.5 flex flex-wrap justify-center gap-x-2 text-[10px] text-neutral-600 print:text-neutral-800">
          {store.phone && <span>โทร: {store.phone}</span>}
          {store.taxId && <span>เลขผู้เสียภาษี: {store.taxId}</span>}
        </div>

        <div className="mt-2.5 border-y border-neutral-900 py-1.5">
          <p className="font-bold tracking-wide uppercase">
            ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ
          </p>
          <p className="text-[9px] tracking-wider text-neutral-500 uppercase print:text-neutral-700">
            TAX INVOICE (ABB) / RECEIPT
          </p>
        </div>
      </header>
      <section className="mt-2 space-y-0.5 border-b border-dashed border-neutral-400 pb-2 text-[10px]">
        <div className="flex justify-between">
          <span className="text-neutral-600 print:text-neutral-800">
            เลขที่เอกสาร:
          </span>
          <span className="font-semibold text-neutral-950">
            #{order.orderNumber}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-600 print:text-neutral-800">
            วันที่:
          </span>
          <span>{formatDateTime(order.paidAt || order.createdAt)}</span>
        </div>
        {extendedOrder.employee?.name && (
          <div className="flex justify-between">
            <span className="text-neutral-600 print:text-neutral-800">
              พนักงาน:
            </span>
            <span>{extendedOrder.employee.name}</span>
          </div>
        )}
        {customer.name && customer.name !== 'ลูกค้าทั่วไป' && (
          <div className="flex justify-between">
            <span className="text-neutral-600 print:text-neutral-800">
              ลูกค้า:
            </span>
            <span className="max-w-[45mm] truncate font-medium">
              {customer.name}
            </span>
          </div>
        )}
      </section>
      <section className="pt-2">
        <div className="flex justify-between border-b border-neutral-900 pb-1 font-semibold text-neutral-900">
          <span>รายการ</span>
          <span>จำนวนเงิน</span>
        </div>
        <div className="space-y-2 pt-2">
          {order.items.map((item) => {
            const itemTotal = Number(item.price) * item.quantity
            return (
              <div key={item.id}>
                <div className="flex items-start justify-between">
                  <span className="pr-2 leading-snug font-medium text-neutral-950">
                    {item.title}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    {formatCurrency(itemTotal)}
                  </span>
                </div>
                <div className="text-[10px] text-neutral-600 print:text-neutral-800">
                  {item.quantity} x {formatCurrency(Number(item.price))}
                  {item.variantTitle && ` (${item.variantTitle})`}
                </div>
              </div>
            )
          })}
        </div>
      </section>
      <section className="mt-2.5 space-y-1 border-t border-dashed border-neutral-400 pt-2 text-[10px]">
        <div className="flex justify-between text-neutral-600 print:text-neutral-800">
          <span>จำนวนสินค้ารวม:</span>
          <span>{totalQuantity} ชิ้น</span>
        </div>
        <div className="flex justify-between text-neutral-600 print:text-neutral-800">
          <span>รวมเป็นเงิน:</span>
          <span>{formatCurrency(itemsSubtotal)}</span>
        </div>
        {pointsDiscount > 0 && (
          <div className="flex justify-between text-neutral-800">
            <span>ส่วนลดแต้ม:</span>
            <span>-{formatCurrency(pointsDiscount)}</span>
          </div>
        )}
        {couponDiscount > 0 && (
          <div className="flex justify-between text-neutral-800">
            <span>ส่วนลดคูปอง:</span>
            <span>-{formatCurrency(couponDiscount)}</span>
          </div>
        )}
        {shippingFee > 0 && (
          <div className="flex justify-between text-neutral-600 print:text-neutral-800">
            <span>ค่าส่ง:</span>
            <span>{formatCurrency(shippingFee)}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-neutral-900 pt-1.5 text-xs font-bold text-neutral-950">
          <span>ยอดรวมสุทธิ:</span>
          <span className="text-sm">{formatCurrency(totalAmount)}</span>
        </div>
      </section>
      <section className="mt-2 space-y-0.5 border-t border-dashed border-neutral-400 pt-2 text-[10px] text-neutral-700 print:text-neutral-900">
        <div className="flex justify-between">
          <span>ช่องทางชำระ:</span>
          <span className="font-medium text-neutral-900">{paymentLabel}</span>
        </div>
        {isCash && (
          <>
            <div className="flex justify-between">
              <span>รับเงิน:</span>
              <span>
                {formatCurrency(
                  Number(extendedOrder.receivedAmount || totalAmount),
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>เงินทอน:</span>
              <span>
                {formatCurrency(Number(extendedOrder.changeAmount || 0))}
              </span>
            </div>
          </>
        )}
        <div className="flex justify-between pt-1 text-[9px] text-neutral-500 print:text-neutral-700">
          <span>
            (ราคารวมภาษีมูลค่าเพิ่ม 7% แล้ว: {formatCurrency(vatAmount)})
          </span>
        </div>
        {earnedPoints > 0 && (
          <div className="flex justify-between pt-0.5 text-[10px] font-medium text-neutral-900">
            <span>แต้มสะสมที่ได้รับ:</span>
            <span>+{earnedPoints} แต้ม</span>
          </div>
        )}
      </section>
      <footer className="mt-3.5 border-t border-dashed border-neutral-400 pt-3 text-center">
        {qrCodeUrl && (
          <div className="mb-2 flex justify-center">
            <img
              src={qrCodeUrl}
              alt="Receipt Verification QR"
              className="h-20 w-20 object-contain"
            />
          </div>
        )}
        <p className="font-semibold text-neutral-900">ขอบคุณที่ใช้บริการ</p>
        <p className="text-[9px] tracking-wider text-neutral-500 uppercase print:text-neutral-700">
          Thank you
        </p>
        <p className="mt-1 text-[8px] text-neutral-500 print:text-neutral-700">
          กรุณาเก็บเอกสารนี้ไว้เพื่อเป็นหลักฐาน
        </p>
      </footer>
    </div>
  )
}
