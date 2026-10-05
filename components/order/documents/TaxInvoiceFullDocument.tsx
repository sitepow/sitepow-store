'use client'

import React from 'react'
import { GetOrdersItem } from '@/actions/sales/order/actions'
import { formatDateTime } from '@/utils/formatting/date'
import { formatCurrency, formatDecimal } from '@/utils/formatting/number'
import { formatPromptPay } from '@/utils/formatting/promptpay-phone'
import { formatThaiBahtText } from '@/utils/formatting/thai-baht-text'
import { DocumentHeader } from './DocumentHeader'
import {
  DocumentOptions,
  extractCustomerDocumentInfo,
  extractStoreDocumentInfo,
} from './types'

interface TaxInvoiceFullDocumentProps {
  order: GetOrdersItem
  options: DocumentOptions
}

export function TaxInvoiceFullDocument({
  order,
  options,
}: TaxInvoiceFullDocumentProps) {
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
  const totalAmount = Number(order.totalAmount)

  // Standard Thai VAT calculations (from VAT-inclusive prices)
  const vatRate = store.vatRate || 7
  const baseBeforeVat = totalAmount / (1 + vatRate / 100)
  const vatAmount = totalAmount - baseBeforeVat

  const docNumber = `TAX-${order.orderNumber}`
  const docDate = formatDateTime(order.paidAt || order.createdAt)

  return (
    <div className="w-full bg-white text-neutral-900 p-8 font-sans print:p-0 print:text-black">
      {/* Header */}
      <DocumentHeader
        titleThai="ใบเสร็จรับเงิน / ใบกำกับภาษี"
        titleEng="TAX INVOICE / RECEIPT"
        documentNumber={docNumber}
        date={docDate}
        subDateLabel="อ้างอิงคำสั่งซื้อ"
        subDateValue={`#${order.orderNumber}`}
        store={store}
        isCopy={options.isCopy}
        showLogo={options.showLogo}
      />

      {/* Customer & Tax Information Grid */}
      <div className="grid grid-cols-2 gap-4 border border-neutral-300 rounded p-3 mb-4 text-xs">
        <div>
          <h2 className="font-bold text-neutral-900 mb-1 border-b pb-0.5 flex items-center justify-between">
            <span>ข้อมูลผู้ซื้อ / ผู้รับบริการ</span>
            <span className="text-[10px] text-neutral-500 font-normal">Customer Info</span>
          </h2>
          <div className="space-y-1 text-neutral-800">
            <p>
              <span className="font-semibold text-neutral-900">ชื่อผู้เสียภาษี: </span>
              <span className="font-bold">{customer.taxName}</span>
            </p>
            <p>
              <span className="font-semibold text-neutral-900">เลขประจำตัวผู้เสียภาษี: </span>
              <span className="font-mono font-medium tracking-wide">
                {customer.taxId !== '-' ? formatPromptPay(customer.taxId) : '-'}
              </span>
            </p>
            <p>
              <span className="font-semibold text-neutral-900">สาขา: </span>
              {customer.taxBranchCode}
            </p>
            <p className="leading-snug">
              <span className="font-semibold text-neutral-900">ที่อยู่จดทะเบียน: </span>
              {customer.taxAddress}
            </p>
            {customer.phone !== '-' && (
              <p>
                <span className="font-semibold text-neutral-900">โทรศัพท์: </span>
                {customer.phone}
              </p>
            )}
          </div>
        </div>

        <div className="border-l border-neutral-200 pl-4">
          <h2 className="font-bold text-neutral-900 mb-1 border-b pb-0.5 flex items-center justify-between">
            <span>รายละเอียดการชำระและจัดส่ง</span>
            <span className="text-[10px] text-neutral-500 font-normal">Payment & Delivery</span>
          </h2>
          <div className="space-y-1 text-neutral-700">
            <p>
              <span className="font-semibold text-neutral-900">วิธีชำระเงิน: </span>
              {order.paymentMethod || 'โอนเงิน / PromptPay'}
            </p>
            <p>
              <span className="font-semibold text-neutral-900">วันที่ทำรายการ: </span>
              {formatDateTime(order.createdAt)}
            </p>
            {order.paidAt && (
              <p>
                <span className="font-semibold text-neutral-900">วันที่รับชำระ: </span>
                {formatDateTime(order.paidAt)}
              </p>
            )}
            {order.trackingNumber && (
              <p>
                <span className="font-semibold text-neutral-900">เลขติดตามพัสดุ: </span>
                {order.trackingNumber} ({order.shippingMethod || 'Standard'})
              </p>
            )}
            <p className="leading-snug text-neutral-600">
              <span className="font-semibold text-neutral-900">ผู้รับพัสดุ: </span>
              {customer.name}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-xs border-collapse border border-neutral-300 mb-4">
        <thead>
          <tr className="bg-neutral-100 text-neutral-800 font-semibold border-b border-neutral-300 print:bg-neutral-200">
            <th className="py-2 px-2.5 text-center border-r border-neutral-300 w-12">ลำดับ</th>
            <th className="py-2 px-3 text-left border-r border-neutral-300">รายการสินค้า / บริการ (Description)</th>
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

      {/* Summary with Thai Tax breakdown */}
      <div className="flex items-start justify-between gap-4 mb-6 print-avoid-break">
        {/* Baht Text & Tax Notice */}
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
          <div className="text-[10px] text-neutral-500 pt-1 leading-snug">
            <p>* ใบเสร็จรับเงิน/ใบกำกับภาษีนี้ สมบูรณ์ต่อเมื่อได้รับเงินชำระเรียบร้อยแล้ว</p>
            <p>* ออกตามมาตรา 86/4 แห่งประมวลรัษฎากร</p>
          </div>
        </div>

        {/* VAT Breakdown Calculation */}
        <div className="w-80 border border-neutral-300 rounded overflow-hidden text-xs">
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

          <div className="flex justify-between px-3 py-1.5 border-b border-neutral-200 text-neutral-700 bg-neutral-50">
            <span>มูลค่าสินค้าก่อนภาษี (Taxable Base)</span>
            <span className="font-medium text-neutral-900">{formatDecimal(baseBeforeVat)}</span>
          </div>

          <div className="flex justify-between px-3 py-1.5 border-b border-neutral-200 text-neutral-700 bg-neutral-50">
            <span>ภาษีมูลค่าเพิ่ม {vatRate}% (VAT)</span>
            <span className="font-medium text-neutral-900">{formatDecimal(vatAmount)}</span>
          </div>

          <div className="flex justify-between px-3 py-2 bg-neutral-900 text-white font-bold text-sm print:bg-neutral-900 print:text-white">
            <span>จำนวนเงินรวมทั้งสิ้น (Total Net)</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      {options.showSignatures && (
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-neutral-300 print-avoid-break text-xs text-center">
          <div className="space-y-12">
            <p className="font-medium text-neutral-800">ผู้รับสินค้าหรือบริการ / Received by</p>
            <div className="border-b border-neutral-400 w-48 mx-auto" />
            <p className="text-neutral-500 text-[11px]">วันที่ ..... / ..... / .........</p>
          </div>
          <div className="space-y-12">
            <p className="font-medium text-neutral-800">
              ผู้มีอำนาจลงนาม / Authorized Signature (ในนาม {store.name})
            </p>
            <div className="border-b border-neutral-400 w-48 mx-auto" />
            <p className="text-neutral-500 text-[11px]">วันที่ ..... / ..... / .........</p>
          </div>
        </div>
      )}
    </div>
  )
}
