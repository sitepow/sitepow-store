'use client'

import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { GetOrdersItem } from '@/actions/sales/order/actions'
import { formatDateTime } from '@/utils/formatting/date'
import { formatCurrency, formatDecimal } from '@/utils/formatting/number'
import { formatPromptPay } from '@/utils/formatting/promptpay-phone'
import { BarcodeSvg } from './BarcodeSvg'
import {
  DocumentOptions,
  extractStoreDocumentInfo,
} from './types'

interface TaxInvoiceAbbrDocumentProps {
  order: GetOrdersItem
  options: DocumentOptions
}

export function TaxInvoiceAbbrDocument({
  order,
  options,
}: TaxInvoiceAbbrDocumentProps) {
  const store = extractStoreDocumentInfo(order)
  const isThermal = options.paperSize === 'SLIP_80MM'

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

  const vatRate = store.vatRate || 7
  const baseBeforeVat = totalAmount / (1 + vatRate / 100)
  const vatAmount = totalAmount - baseBeforeVat

  const docNumber = `ABB-${order.orderNumber}`
  const docDate = formatDateTime(order.paidAt || order.createdAt)

  // Generate QR Code for Order lookup / verification
  const [qrUrl, setQrUrl] = useState<string>('')
  useEffect(() => {
    const payload = `${order.orderNumber}|${order.totalAmount}|${order.storeId}`
    QRCode.toDataURL(payload, { width: 120, margin: 1 }, (err, url) => {
      if (!err && url) {
        setQrUrl(url)
      }
    })
  }, [order.orderNumber, order.totalAmount, order.storeId])

  const employeeName = (order as { employee?: { name?: string } }).employee?.name || 'พนักงานขาย (Staff)'

  return (
    <div
      className={`mx-auto bg-white text-neutral-900  print:text-black ${
        isThermal
          ? 'w-[78mm] max-w-[78mm] p-3 text-[11px] leading-tight thermal-slip-print'
          : 'w-full max-w-xl p-8 text-xs leading-normal font-sans border rounded'
      }`}
    >
      {/* Store Header */}
      <div className="text-center space-y-1 pb-2 border-b border-dashed border-neutral-400">
        <h1 className="text-sm font-bold tracking-tight text-neutral-900">
          {store.name}
        </h1>
        <p className="text-[10px] text-neutral-600">
          {store.branchCode || 'สำนักงานใหญ่'}
        </p>
        {store.taxId && (
          <p className="text-[10px] font-semibold text-neutral-800">
            เลขประจำตัวผู้เสียภาษี: {formatPromptPay(store.taxId)}
          </p>
        )}
        {store.address && (
          <p className="text-[10px] text-neutral-600 leading-tight">
            {store.address}
          </p>
        )}
        {store.phone && (
          <p className="text-[10px] text-neutral-600">
            โทร: {store.phone}
          </p>
        )}

        <div className="pt-1.5 pb-0.5">
          <div className="font-bold text-xs uppercase tracking-wider text-neutral-900 border-y border-neutral-900 py-1 inline-block px-3">
            ใบกำกับภาษีอย่างย่อ / ใบเสร็จรับเงิน
          </div>
          <div className="text-[9px] text-neutral-500 uppercase mt-0.5">
            (TAX INVOICE / RECEIPT - ABB)
          </div>
        </div>
      </div>

      {/* Meta Info */}
      <div className="py-2 border-b border-dashed border-neutral-400 text-[10px] space-y-0.5 text-neutral-700">
        <div className="flex justify-between">
          <span>เลขที่ (No.):</span>
          <span className="font-bold text-neutral-900">{docNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>วันที่ (Date):</span>
          <span>{docDate}</span>
        </div>
        <div className="flex justify-between">
          <span>แคชเชียร์/พนักงาน:</span>
          <span>{employeeName}</span>
        </div>
        <div className="flex justify-between">
          <span>ช่องทางชำระเงิน:</span>
          <span className="font-medium text-neutral-900">
            {order.paymentMethod || 'โอนเงิน / PromptPay'}
          </span>
        </div>
        {order.customer && (
          <div className="flex justify-between text-neutral-600">
            <span>ลูกค้า:</span>
            <span>
              {[order.customer.firstName, order.customer.lastName]
                .filter(Boolean)
                .join(' ') || 'ลูกค้าทั่วไป'}
            </span>
          </div>
        )}
      </div>

      {/* Items List */}
      <div className="py-2 border-b border-dashed border-neutral-400">
        <div className="flex justify-between font-bold text-[10px] border-b border-neutral-300 pb-1 mb-1">
          <span className="flex-1">รายการ (Item)</span>
          <span className="w-12 text-center">จำนวน</span>
          <span className="w-16 text-right">จำนวนเงิน</span>
        </div>
        <div className="space-y-1.5 text-[10px]">
          {items.map((item, idx) => {
            const lineTotal = Number(item.price) * item.quantity
            return (
              <div key={item.id || idx}>
                <div className="flex justify-between items-start">
                  <div className="flex-1 pr-1 font-medium text-neutral-900">
                    {item.title}
                  </div>
                  <div className="w-12 text-center text-neutral-700">
                    x{item.quantity}
                  </div>
                  <div className="w-16 text-right font-medium text-neutral-900">
                    {formatDecimal(lineTotal)}
                  </div>
                </div>
                {item.variantTitle && (
                  <div className="text-[9px] text-neutral-500 pl-1">
                    -{item.variantTitle}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Totals & Tax Calculation */}
      <div className="py-2 border-b border-dashed border-neutral-400 text-[10px] space-y-1 text-neutral-800">
        <div className="flex justify-between">
          <span>รวมสินค้า (Subtotal):</span>
          <span>{formatDecimal(subtotal)}</span>
        </div>

        {totalDiscount > 0 && (
          <div className="flex justify-between text-rose-600">
            <span>ส่วนลด (Discount):</span>
            <span>-{formatDecimal(totalDiscount)}</span>
          </div>
        )}

        {shippingFee > 0 && (
          <div className="flex justify-between">
            <span>ค่าส่ง (Shipping):</span>
            <span>+{formatDecimal(shippingFee)}</span>
          </div>
        )}

        <div className="flex justify-between text-xs font-bold pt-1 border-t border-neutral-300 text-neutral-900">
          <span>ยอดสุทธิ (Net Total):</span>
          <span>{formatCurrency(totalAmount)}</span>
        </div>

        {/* VAT breakdown note as required by Sec. 86/6 */}
        <div className="pt-2 border-t border-dotted border-neutral-300 text-[9px] text-neutral-600 space-y-0.5">
          <div className="font-semibold text-center text-neutral-800 pb-0.5">
            * ราคาสินค้ารวมภาษีมูลค่าเพิ่มแล้ว (VAT Included) *
          </div>
          <div className="flex justify-between">
            <span>มูลค่าสินค้าไม่รวม VAT:</span>
            <span>{formatDecimal(baseBeforeVat)}</span>
          </div>
          <div className="flex justify-between">
            <span>ภาษีมูลค่าเพิ่ม ({vatRate}%):</span>
            <span>{formatDecimal(vatAmount)}</span>
          </div>
        </div>
      </div>

      {/* Barcode & Verification */}
      <div className="pt-3 text-center space-y-2">
        <div className="flex justify-center">
          <BarcodeSvg
            value={order.orderNumber}
            height={36}
            moduleWidth={1.3}
            showText={true}
          />
        </div>

        {qrUrl && (
          <div className="flex flex-col items-center justify-center pt-1">
            <img
              src={qrUrl}
              alt="Order QR Code"
              className="size-20 border border-neutral-200 p-0.5"
            />
            <span className="text-[8px] text-neutral-500 mt-0.5">
              สแกนตรวจสอบคำสั่งซื้อ
            </span>
          </div>
        )}

        {options.customNote && (
          <p className="text-[9px] text-neutral-700 whitespace-pre-line pt-1">
            {options.customNote}
          </p>
        )}

        <div className="text-[9px] text-neutral-500 pt-1 space-y-0.5 leading-tight">
          <p>ขอบคุณที่ใช้บริการ / Thank you</p>
          <p>โปรดเก็บใบเสร็จนี้ไว้เพื่อเป็นหลักฐาน</p>
        </div>
      </div>
    </div>
  )
}
