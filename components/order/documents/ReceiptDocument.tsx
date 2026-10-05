'use client'

import React from 'react'
import { GetOrdersItem } from '@/actions/sales/order/actions'
import { formatDateTime } from '@/utils/formatting/date'
import { formatCurrency, formatDecimal } from '@/utils/formatting/number'
import { formatThaiBahtText } from '@/utils/formatting/thai-baht-text'
import { DocumentHeader } from './DocumentHeader'
import {
  DocumentOptions,
  extractCustomerDocumentInfo,
  extractStoreDocumentInfo,
} from './types'

interface ReceiptDocumentProps {
  order: GetOrdersItem
  options: DocumentOptions
}

export function ReceiptDocument({ order, options }: ReceiptDocumentProps) {
  const store = extractStoreDocumentInfo(order)
  const customer = extractCustomerDocumentInfo(order)

  const items = order.items || []
  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  )

  const pointsDiscount = Number(order.pointsDiscount || 0)
  const couponDiscount = Number(order.coupon?.discountAmount || 0)
  const totalDiscount = pointsDiscount + couponDiscount
  const shippingFee = Number(order.shippingFee || 0)
  const codFee = Number(order.codFee || 0)
  const totalAmount = Number(order.totalAmount)

  const docNumber = `REC-${order.orderNumber}`
  const docDate = formatDateTime(order.paidAt || order.createdAt)
  const orderDate = formatDateTime(order.createdAt)

  return (
    <div className="w-full bg-white text-neutral-900 p-8 font-sans print:p-0 print:text-black">
      {/* Header */}
      <DocumentHeader
        titleThai="ใบเสร็จรับเงิน"
        titleEng="RECEIPT"
        documentNumber={docNumber}
        date={docDate}
        subDateLabel="อ้างอิงออเดอร์"
        subDateValue={`#${order.orderNumber}`}
        store={store}
        isCopy={options.isCopy}
        showLogo={options.showLogo}
      />

      {/* Customer & Payment Information */}
      <div className="grid grid-cols-2 gap-4 border border-neutral-300 rounded p-3 mb-4 text-xs">
        <div>
          <h2 className="font-bold text-neutral-900 mb-1 border-b pb-0.5">
            ข้อมูลลูกค้า (Customer Information)
          </h2>
          <div className="space-y-0.5 text-neutral-700">
            <p>
              <span className="font-semibold text-neutral-900">ชื่อผู้ซื้อ: </span>
              {customer.name}
            </p>
            {customer.phone !== '-' && (
              <p>
                <span className="font-semibold text-neutral-900">เบอร์โทร: </span>
                {customer.phone}
              </p>
            )}
            {customer.email !== '-' && (
              <p>
                <span className="font-semibold text-neutral-900">อีเมล: </span>
                {customer.email}
              </p>
            )}
            <p className="leading-snug">
              <span className="font-semibold text-neutral-900">ที่อยู่จัดส่ง: </span>
              {customer.address}
            </p>
          </div>
        </div>

        <div className="border-l border-neutral-200 pl-4">
          <h2 className="font-bold text-neutral-900 mb-1 border-b pb-0.5">
            ข้อมูลการชำระเงิน (Payment Details)
          </h2>
          <div className="space-y-0.5 text-neutral-700">
            <p>
              <span className="font-semibold text-neutral-900">วิธีชำระเงิน: </span>
              {order.paymentMethod || 'โอนเงิน / PromptPay'}
            </p>
            <p>
              <span className="font-semibold text-neutral-900">วันที่สั่งซื้อ: </span>
              {orderDate}
            </p>
            {order.paidAt && (
              <p>
                <span className="font-semibold text-neutral-900">วันที่รับชำระ: </span>
                {formatDateTime(order.paidAt)}
              </p>
            )}
            {order.transactionId && (
              <p>
                <span className="font-semibold text-neutral-900">เลขอ้างอิง: </span>
                {order.transactionId}
              </p>
            )}
            {order.trackingNumber && (
              <p>
                <span className="font-semibold text-neutral-900">เลขพัสดุ: </span>
                {order.trackingNumber} ({order.shippingMethod || 'จัดส่งมาตรฐาน'})
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-xs border-collapse border border-neutral-300 mb-4">
        <thead>
          <tr className="bg-neutral-100 text-neutral-800 font-semibold border-b border-neutral-300 print:bg-neutral-200">
            <th className="py-2 px-2.5 text-center border-r border-neutral-300 w-12">ลำดับ</th>
            <th className="py-2 px-3 text-left border-r border-neutral-300">รายการสินค้า / รายละเอียด</th>
            <th className="py-2 px-2.5 text-center border-r border-neutral-300 w-16">จำนวน</th>
            <th className="py-2 px-3 text-right border-r border-neutral-300 w-24">ราคา/หน่วย</th>
            <th className="py-2 px-3 text-right w-28">จำนวนเงิน (บาท)</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => {
            const lineTotal = Number(item.price) * item.quantity
            return (
              <tr
                key={item.id || index}
                className="border-b border-neutral-200 text-neutral-800"
              >
                <td className="py-2 px-2.5 text-center border-r border-neutral-300 text-neutral-600">
                  {index + 1}
                </td>
                <td className="py-2 px-3 border-r border-neutral-300">
                  <div className="font-medium text-neutral-900">{item.title}</div>
                  {item.variantTitle && (
                    <div className="text-[11px] text-neutral-600">
                      ตัวเลือก: {item.variantTitle}
                    </div>
                  )}
                  {item.customerNote && (
                    <div className="text-[10px] text-neutral-500 italic">
                      หมายเหตุ: {item.customerNote}
                    </div>
                  )}
                </td>
                <td className="py-2 px-2.5 text-center border-r border-neutral-300">
                  {item.quantity}
                </td>
                <td className="py-2 px-3 text-right border-r border-neutral-300">
                  {formatDecimal(item.price)}
                </td>
                <td className="py-2 px-3 text-right font-medium">
                  {formatDecimal(lineTotal)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>

      {/* Summary Calculation */}
      <div className="flex items-start justify-between gap-4 mb-6 print-avoid-break">
        {/* Thai Baht text & Notes */}
        <div className="flex-1 border border-neutral-300 rounded p-3 text-xs space-y-2">
          <div>
            <span className="font-semibold text-neutral-700">จำนวนเงินตัวอักษร:</span>
            <p className="font-bold text-neutral-900 mt-0.5 text-sm bg-neutral-50 p-1.5 rounded border border-neutral-200">
              {formatThaiBahtText(totalAmount)}
            </p>
          </div>
          {options.customNote && (
            <div>
              <span className="font-semibold text-neutral-700">หมายเหตุ:</span>
              <p className="text-neutral-700 whitespace-pre-line mt-0.5">
                {options.customNote}
              </p>
            </div>
          )}
          <p className="text-[10px] text-neutral-500 pt-1">
            * เอกสารนี้จัดทำขึ้นโดยระบบอิเล็กทรอนิกส์ของทางร้านค้า
          </p>
        </div>

        {/* Calculation Table */}
        <div className="w-72 border border-neutral-300 rounded overflow-hidden text-xs">
          <div className="flex justify-between px-3 py-1.5 border-b border-neutral-200 text-neutral-700">
            <span>รวมเป็นเงิน (Subtotal)</span>
            <span className="font-medium text-neutral-900">{formatDecimal(subtotal)}</span>
          </div>

          {totalDiscount > 0 && (
            <div className="flex justify-between px-3 py-1.5 border-b border-neutral-200 text-rose-600">
              <span>ส่วนลดรวม (Discount)</span>
              <span>-{formatDecimal(totalDiscount)}</span>
            </div>
          )}

          {shippingFee > 0 && (
            <div className="flex justify-between px-3 py-1.5 border-b border-neutral-200 text-neutral-700">
              <span>ค่าจัดส่ง (Shipping Fee)</span>
              <span className="font-medium text-neutral-900">+{formatDecimal(shippingFee)}</span>
            </div>
          )}

          {codFee > 0 && (
            <div className="flex justify-between px-3 py-1.5 border-b border-neutral-200 text-neutral-700">
              <span>ค่าบริการ COD</span>
              <span className="font-medium text-neutral-900">+{formatDecimal(codFee)}</span>
            </div>
          )}

          <div className="flex justify-between px-3 py-2 bg-neutral-900 text-white font-bold text-sm print:bg-neutral-900 print:text-white">
            <span>ยอดชำระสุทธิ (Net Total)</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      {options.showSignatures && (
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-neutral-300 print-avoid-break text-xs text-center">
          <div className="space-y-12">
            <p className="font-medium text-neutral-800">ผู้ชำระเงิน / Paid By</p>
            <div className="border-b border-neutral-400 w-48 mx-auto" />
            <p className="text-neutral-500 text-[11px]">วันที่ ..... / ..... / .........</p>
          </div>
          <div className="space-y-12">
            <p className="font-medium text-neutral-800">
              ผู้รับเงิน / Receiver (ในนาม {store.name})
            </p>
            <div className="border-b border-neutral-400 w-48 mx-auto" />
            <p className="text-neutral-500 text-[11px]">วันที่ ..... / ..... / .........</p>
          </div>
        </div>
      )}
    </div>
  )
}
