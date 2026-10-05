'use client'

import React, { useEffect, useState } from 'react'
import generatePayload from 'promptpay-qr'
import QRCode from 'qrcode'
import { GetOrdersItem } from '@/actions/sales/order/actions'
import { formatDateTime } from '@/utils/formatting/date'
import { formatCurrency, formatDecimal } from '@/utils/formatting/number'
import { formatBankAccount, formatPromptPay } from '@/utils/formatting/promptpay-phone'
import { formatThaiBahtText } from '@/utils/formatting/thai-baht-text'
import { DocumentHeader } from './DocumentHeader'
import {
  DocumentOptions,
  extractCustomerDocumentInfo,
  extractStoreDocumentInfo,
} from './types'

interface InvoiceBillDocumentProps {
  order: GetOrdersItem
  options: DocumentOptions
}

export function InvoiceBillDocument({ order, options }: InvoiceBillDocumentProps) {
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

  const docNumber = `INV-${order.orderNumber}`
  const docDate = formatDateTime(order.createdAt)

  // Due date: 7 days after order date by default
  const createdDateObj = new Date(order.createdAt)
  const dueDateObj = new Date(createdDateObj.getTime() + 7 * 24 * 60 * 60 * 1000)
  const dueDate = formatDateTime(dueDateObj)

  // PromptPay QR Generation if PromptPay info available
  const [promptPayQr, setPromptPayQr] = useState<string>('')
  const bankAccount = order.bankAccount

  useEffect(() => {
    const targetId = bankAccount?.promptPayId || bankAccount?.accountNumber
    if (targetId) {
      try {
        const payload = generatePayload(targetId, { amount: totalAmount })
        QRCode.toDataURL(payload, { width: 140, margin: 1 }, (err, url) => {
          if (!err && url) {
            setPromptPayQr(url)
          }
        })
      } catch (err) {
        console.error('Error generating promptpay qr for invoice:', err)
      }
    }
  }, [bankAccount, totalAmount])

  return (
    <div className="w-full bg-white text-neutral-900 p-8 font-sans print:p-0 print:text-black">
      {/* Header */}
      <DocumentHeader
        titleThai="ใบแจ้งหนี้ / ใบวางบิล"
        titleEng="INVOICE / BILLING NOTE"
        documentNumber={docNumber}
        date={docDate}
        subDateLabel="กำหนดชำระ (Due Date)"
        subDateValue={dueDate}
        store={store}
        isCopy={options.isCopy}
        showLogo={options.showLogo}
      />

      {/* Customer & Order Information */}
      <div className="grid grid-cols-2 gap-4 border border-neutral-300 rounded p-3 mb-4 text-xs">
        <div>
          <h2 className="font-bold text-neutral-900 mb-1 border-b pb-0.5">
            ข้อมูลลูกค้า / ผู้สั่งซื้อ (Bill To)
          </h2>
          <div className="space-y-0.5 text-neutral-700">
            <p>
              <span className="font-semibold text-neutral-900">ชื่อลูกค้า: </span>
              {customer.taxName || customer.name}
            </p>
            {customer.taxId !== '-' && (
              <p>
                <span className="font-semibold text-neutral-900">เลขประจำตัวผู้เสียภาษี: </span>
                {customer.taxId}
              </p>
            )}
            <p className="leading-snug">
              <span className="font-semibold text-neutral-900">ที่อยู่: </span>
              {customer.taxAddress || customer.address}
            </p>
            <p>
              <span className="font-semibold text-neutral-900">เบอร์โทรศัพท์: </span>
              {customer.phone}
            </p>
          </div>
        </div>

        <div className="border-l border-neutral-200 pl-4">
          <h2 className="font-bold text-neutral-900 mb-1 border-b pb-0.5">
            ข้อมูลคำสั่งซื้อ (Order Details)
          </h2>
          <div className="space-y-0.5 text-neutral-700">
            <p>
              <span className="font-semibold text-neutral-900">เลขที่คำสั่งซื้อ: </span>
              #{order.orderNumber}
            </p>
            <p>
              <span className="font-semibold text-neutral-900">วันที่สั่งซื้อ: </span>
              {docDate}
            </p>
            <p>
              <span className="font-semibold text-neutral-900">สถานะคำสั่งซื้อ: </span>
              <span className="font-medium text-neutral-900">{order.status}</span>
            </p>
            <p>
              <span className="font-semibold text-neutral-900">วิธีการจัดส่ง: </span>
              {order.shippingMethod || 'จัดส่งมาตรฐาน'}
            </p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-xs border-collapse border border-neutral-300 mb-4">
        <thead>
          <tr className="bg-neutral-100 text-neutral-800 font-semibold border-b border-neutral-300 print:bg-neutral-200">
            <th className="py-2 px-2.5 text-center border-r border-neutral-300 w-12">ลำดับ</th>
            <th className="py-2 px-3 text-left border-r border-neutral-300">รายการสินค้า (Description)</th>
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

      {/* Summary & Payment Instructions */}
      <div className="flex items-start justify-between gap-4 mb-6 print-avoid-break">
        {/* Payment Account Details */}
        <div className="flex-1 border border-neutral-300 rounded p-3 text-xs space-y-2">
          <h3 className="font-bold text-neutral-900 border-b pb-1">
            ช่องทางการชำระเงิน (Payment Options)
          </h3>

          <div className="flex gap-4 items-center">
            {promptPayQr && (
              <div className="text-center shrink-0">
                <img
                  src={promptPayQr}
                  alt="PromptPay QR"
                  className="size-24 border border-neutral-300 p-0.5 rounded"
                />
                <span className="text-[10px] text-neutral-600 font-medium block mt-0.5">
                  Scan to Pay
                </span>
              </div>
            )}
            <div className="space-y-1 text-neutral-700 text-xs">
              {bankAccount ? (
                <>
                  <p>
                    <span className="font-semibold text-neutral-900">ธนาคาร: </span>
                    {bankAccount.bankName}
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-900">เลขที่บัญชี: </span>
                    <span className=" font-bold text-neutral-900">
                      {formatBankAccount(bankAccount.accountNumber)}
                    </span>
                  </p>
                  <p>
                    <span className="font-semibold text-neutral-900">ชื่อบัญชี: </span>
                    {bankAccount.accountName}
                  </p>
                  {bankAccount.promptPayId && (
                    <p>
                      <span className="font-semibold text-neutral-900">พร้อมเพย์: </span>
                      {formatPromptPay(bankAccount.promptPayId)}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-neutral-500 italic">
                  กรุณาติดต่อร้านค้าเพื่อรับข้อมูลบัญชีสำหรับการชำระเงิน
                </p>
              )}
            </div>
          </div>

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

          <div className="flex justify-between px-3 py-2 bg-neutral-900 text-white font-bold text-sm print:bg-neutral-900 print:text-white">
            <span>ยอดที่ต้องชำระ (Total Due)</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>
        </div>
      </div>

      {/* Signature Section */}
      {options.showSignatures && (
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-neutral-300 print-avoid-break text-xs text-center">
          <div className="space-y-12">
            <p className="font-medium text-neutral-800">
              ผู้วางบิล / Issued by (ในนาม {store.name})
            </p>
            <div className="border-b border-neutral-400 w-48 mx-auto" />
            <p className="text-neutral-500 text-[11px]">วันที่ ..... / ..... / .........</p>
          </div>
          <div className="space-y-12">
            <p className="font-medium text-neutral-800">
              ผู้รับวางบิล / Received by (ลูกค้านัดชำระเงิน)
            </p>
            <div className="border-b border-neutral-400 w-48 mx-auto" />
            <p className="text-neutral-500 text-[11px]">วันที่นัดชำระ ..... / ..... / .........</p>
          </div>
        </div>
      )}
    </div>
  )
}
