'use client'

import { useEffect, useState } from 'react'

import { PAYMENT_METHOD_TH } from '@/constants/translate'
import { PaymentMethod } from '@/generated/prisma/enums'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import QRCode from 'qrcode'

import { OrderDocComponentProps } from './types'
import { getCustomerInfoFromOrder, getStoreInfoFromOrder } from './utils'

export function ReceiptSlipDoc({ order }: OrderDocComponentProps) {
  const store = getStoreInfoFromOrder(order)
  const customer = getCustomerInfoFromOrder(order)

  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')

  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  )

  const totalAmount = Number(order.totalAmount)
  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  const vatAmount = totalAmount - totalAmount / 1.07

  const isCash =
    order.paymentMethod === PaymentMethod.CASH_ON_DELIVERY ||
    (order as any).paymentMethod === PaymentMethod.CASH_ON_DELIVERY

  const employeeName = (order as { employee?: { name?: string } }).employee
    ?.name

  useEffect(() => {
    let isMounted = true
    QRCode.toDataURL(`ORD-${order.orderNumber}`, {
      margin: 0,
      width: 120,
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
    <div className="mx-auto w-full max-w-[80mm] bg-white p-3 font-mono text-xs leading-tight text-black print:m-0 print:max-w-none print:p-1">
      <div className="text-center">
        {store.logo && (
          <img
            src={store.logo}
            alt={store.name}
            className="mx-auto mb-1.5 h-12 w-12 rounded object-cover"
          />
        )}
        <h2 className="text-sm font-bold tracking-tight">{store.name}</h2>
        {order.items[0]?.branch?.name && (
          <p className="text-[11px] text-neutral-600">
            สาขา: {order.items[0].branch.name}
          </p>
        )}
        {store.address && (
          <p className="mt-0.5 text-[10px] leading-snug text-neutral-600">
            {store.address}
          </p>
        )}
        {store.phone && (
          <p className="text-[10px] text-neutral-600">โทร: {store.phone}</p>
        )}
        {store.taxId && (
          <p className="text-[10px] text-neutral-600">
            เลขประจำตัวผู้เสียภาษี: {store.taxId}
          </p>
        )}
        <div className="mt-2 border-t border-b border-neutral-800 py-1">
          <p className="text-[11px] font-bold tracking-wide uppercase">
            ใบเสร็จรับเงิน / ใบกำกับภาษีอย่างย่อ
          </p>
          <p className="text-[9px] text-neutral-500 uppercase">
            TAX INVOICE (ABB) / RECEIPT
          </p>
        </div>
      </div>
      <div className="mt-2 space-y-0.5 text-[11px]">
        <div className="flex justify-between">
          <span>เลขที่:</span>
          <span className="font-bold">#{order.orderNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>วันที่:</span>
          <span>{formatDateTime(order.paidAt || order.createdAt)}</span>
        </div>
        {employeeName && (
          <div className="flex justify-between">
            <span>พนักงาน:</span>
            <span>{employeeName}</span>
          </div>
        )}
        {customer.name && customer.name !== 'ลูกค้าทั่วไป' && (
          <div className="flex justify-between">
            <span>ลูกค้า:</span>
            <span className="max-w-35 truncate">{customer.name}</span>
          </div>
        )}
      </div>
      <div className="mt-2 border-t border-dashed border-neutral-300 pt-1.5">
        <div className="flex justify-between pb-1 text-[11px] font-semibold text-neutral-700">
          <span>รายการ</span>
          <span>จำนวนเงิน</span>
        </div>
        <div className="space-y-1.5 pt-0.5">
          {order.items.map((item) => {
            const itemTotal = Number(item.price) * item.quantity
            return (
              <div key={item.id} className="text-[11px]">
                <div className="flex items-start justify-between">
                  <span className="pr-2 leading-snug font-medium text-neutral-900">
                    {item.title}
                  </span>
                  <span className="font-medium whitespace-nowrap">
                    {formatCurrency(itemTotal)}
                  </span>
                </div>
                <div className="flex justify-between pl-1 text-[10px] text-neutral-500">
                  <span>
                    {item.quantity} x {formatCurrency(Number(item.price))}
                    {item.variantTitle ? ` (${item.variantTitle})` : ''}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-2 space-y-1 border-t border-dashed border-neutral-800 pt-2 text-[11px]">
        <div className="flex justify-between text-neutral-600">
          <span>จำนวนรวม:</span>
          <span>{totalQuantity} ชิ้น</span>
        </div>
        <div className="flex justify-between text-neutral-600">
          <span>รวมเป็นเงิน:</span>
          <span>{formatCurrency(itemsSubtotal)}</span>
        </div>
        {Number(order.pointsDiscount || 0) > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>ส่วนลดแต้ม:</span>
            <span>-{formatCurrency(Number(order.pointsDiscount))}</span>
          </div>
        )}
        {order.coupon && Number(order.coupon.discountAmount || 0) > 0 && (
          <div className="flex justify-between text-emerald-700">
            <span>ส่วนลดคูปอง:</span>
            <span>-{formatCurrency(Number(order.coupon.discountAmount))}</span>
          </div>
        )}
        {Number(order.shippingFee || 0) > 0 && (
          <div className="flex justify-between text-neutral-600">
            <span>ค่าส่ง:</span>
            <span>{formatCurrency(Number(order.shippingFee))}</span>
          </div>
        )}
        <div className="flex justify-between border-t border-neutral-800 pt-1 text-sm font-bold">
          <span>ยอดรวมสุทธิ:</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>
      </div>
      <div className="mt-2 space-y-0.5 border-t border-dashed border-neutral-300 pt-1.5 text-[10px] text-neutral-600">
        <div className="flex justify-between">
          <span>ช่องทางชำระ:</span>
          <span className="font-medium text-neutral-800">
            {order.paymentMethod
              ? (PAYMENT_METHOD_TH as any)[order.paymentMethod] ||
                order.paymentMethod
              : 'เงินสด'}
          </span>
        </div>
        {isCash && (
          <>
            <div className="flex justify-between">
              <span>รับเงินมา:</span>
              <span>
                {formatCurrency(
                  Number((order as any).receivedAmount || totalAmount),
                )}
              </span>
            </div>
            <div className="flex justify-between">
              <span>เงินทอน:</span>
              <span>
                {formatCurrency(Number((order as any).changeAmount || 0))}
              </span>
            </div>
          </>
        )}
        <div className="flex justify-between pt-0.5 text-[9px] text-neutral-500">
          <span>ราคารวมภาษีมูลค่าเพิ่ม 7%:</span>
          <span>{formatCurrency(vatAmount)}</span>
        </div>
        {Number(order.earnedPoints || 0) > 0 && (
          <div className="text-primary flex justify-between pt-0.5 text-[10px] font-medium">
            <span>แต้มสะสมที่ได้รับ:</span>
            <span>+{order.earnedPoints} แต้ม</span>
          </div>
        )}
      </div>
      <div className="mt-3 border-t border-dashed border-neutral-300 pt-2 text-center">
        {qrCodeUrl && (
          <div className="mb-1.5 flex justify-center">
            <img
              src={qrCodeUrl}
              alt="Slip QR"
              className="h-16 w-16 object-contain"
            />
          </div>
        )}
        <p className="text-[11px] font-bold text-neutral-800">
          ขอบคุณที่ใช้บริการ
        </p>
        <p className="text-[9px] text-neutral-400">THANK YOU</p>
        <p className="mt-1 text-[8px] text-neutral-400">
          กรุณาเก็บใบเสร็จไว้เป็นหลักฐานการซื้อสินค้า
        </p>
      </div>
    </div>
  )
}
