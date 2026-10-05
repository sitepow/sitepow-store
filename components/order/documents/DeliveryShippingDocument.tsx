'use client'

import React from 'react'
import { GetOrdersItem, ShippingAddressSnapshot } from '@/actions/sales/order/actions'
import { formatDateTime } from '@/utils/formatting/date'
import { formatCurrency, formatDecimal } from '@/utils/formatting/number'
import { formatPromptPay } from '@/utils/formatting/promptpay-phone'
import { BarcodeSvg } from './BarcodeSvg'
import {
  DocumentOptions,
  extractCustomerDocumentInfo,
  extractStoreDocumentInfo,
} from './types'

interface DeliveryShippingDocumentProps {
  order: GetOrdersItem
  options: DocumentOptions
}

export function DeliveryShippingDocument({
  order,
  options,
}: DeliveryShippingDocumentProps) {
  const store = extractStoreDocumentInfo(order)
  const customer = extractCustomerDocumentInfo(order)
  const shippingAddr = (order.shippingAddrSnapshot as ShippingAddressSnapshot | null) || null

  const postalCode = shippingAddr?.postalCode || '-'
  const trackingNumber = order.trackingNumber || order.orderNumber

  const isCOD = Number(order.codFee || 0) > 0 || String(order.paymentMethod).toUpperCase().includes('COD')
  const totalAmount = Number(order.totalAmount)

  const items = order.items || []

  return (
    <div className="w-full bg-white text-neutral-900 p-6 font-sans print:p-0 print:text-black">
      {/* ================= SECTION 1: SHIPPING LABEL (AIR WAYBILL) ================= */}
      <div className="border-2 border-neutral-900 rounded-lg p-4 mb-6 relative">
        {/* Top Header Row */}
        <div className="flex items-center justify-between border-b-2 border-neutral-900 pb-3 mb-3">
          <div className="flex items-center gap-3">
            {options.showLogo && store.logo && (
              <img
                src={store.logo}
                alt={store.name}
                className="size-12 object-contain rounded border border-neutral-300 p-0.5"
              />
            )}
            <div>
              <h2 className="text-base font-bold text-neutral-900 leading-tight">
                {store.name}
              </h2>
              <p className="text-xs text-neutral-600">
                ขนส่ง: {order.shippingMethod || 'Standard Courier Delivery'}
              </p>
            </div>
          </div>

          {/* Payment Status Tag */}
          <div>
            {isCOD ? (
              <div className="border-2 border-neutral-900 bg-neutral-900 text-white px-3 py-1.5 rounded text-center">
                <span className="text-[10px] uppercase font-bold tracking-wider block">
                  เก็บเงินปลายทาง (COD)
                </span>
                <span className="text-base font-extrabold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            ) : (
              <div className="border-2 border-emerald-600 bg-emerald-50 text-emerald-800 px-3 py-1 rounded text-center">
                <span className="text-xs font-bold uppercase tracking-wider block">
                  ชำระเงินเรียบร้อยแล้ว (PAID)
                </span>
                <span className="text-[10px] text-neutral-600">
                  (ไม่ต้องเก็บเงินปลายทาง)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Barcode & Order Number Barcode */}
        <div className="grid grid-cols-2 gap-4 border-b-2 border-neutral-900 pb-3 mb-3 text-center">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-neutral-600 uppercase">
              เลขพัสดุ (Tracking Number)
            </span>
            <div className="flex justify-center">
              <BarcodeSvg
                value={trackingNumber}
                height={48}
                moduleWidth={1.5}
                showText={true}
              />
            </div>
          </div>
          <div className="space-y-1 border-l border-neutral-300 pl-4">
            <span className="text-[11px] font-semibold text-neutral-600 uppercase">
              หมายเลขคำสั่งซื้อ (Order Number)
            </span>
            <div className="flex justify-center">
              <BarcodeSvg
                value={order.orderNumber}
                height={48}
                moduleWidth={1.5}
                showText={true}
              />
            </div>
          </div>
        </div>

        {/* Sender & Receiver Address Grid */}
        <div className="grid grid-cols-12 gap-3 mb-3">
          {/* Sender (4 cols) */}
          <div className="col-span-5 border border-neutral-300 rounded p-2.5 text-xs">
            <span className="font-bold text-neutral-900 text-[11px] block border-b pb-0.5 mb-1">
              ผู้ส่ง (FROM / SENDER)
            </span>
            <p className="font-bold text-neutral-900">{store.name}</p>
            {store.branchCode && (
              <p className="text-neutral-700 text-[11px]">{store.branchCode}</p>
            )}
            <p className="text-neutral-700 leading-snug mt-0.5">
              {store.address || 'ประเทศไทย'}
            </p>
            {store.phone && (
              <p className="text-neutral-900 font-medium mt-1">
                โทร: {formatPromptPay(store.phone)}
              </p>
            )}
          </div>

          {/* Receiver (7 cols) */}
          <div className="col-span-7 border-2 border-neutral-900 rounded p-2.5 text-xs bg-neutral-50/50">
            <span className="font-bold text-neutral-900 text-[11px] block border-b border-neutral-400 pb-0.5 mb-1 flex justify-between items-center">
              <span>ผู้รับ (TO / RECEIVER)</span>
              <span className="text-[10px] text-neutral-500 font-normal">
                ปลายทางจัดส่ง
              </span>
            </span>
            <p className="text-sm font-extrabold text-neutral-900">
              {shippingAddr?.receiverName || shippingAddr?.name || customer.name}
            </p>
            <p className="text-neutral-900 leading-snug text-xs mt-1 font-medium">
              {customer.address}
            </p>
            {customer.phone !== '-' && (
              <p className="text-sm font-bold text-neutral-900 mt-1">
                โทร: {formatPromptPay(customer.phone)}
              </p>
            )}

            {/* Big Postal Code Box */}
            <div className="mt-2 pt-1 border-t border-dashed border-neutral-300 flex items-center justify-between">
              <span className="text-[11px] font-bold text-neutral-700">
                รหัสไปรษณีย์:
              </span>
              <div className="flex gap-1  text-base font-extrabold">
                {postalCode.split('').map((char, i) => (
                  <span
                    key={i}
                    className="border-2 border-neutral-900 bg-white px-2 py-0.5 rounded shadow-sm"
                  >
                    {char}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Item Content Summary & Warnings */}
        <div className="flex items-center justify-between border-t border-neutral-300 pt-2 text-[10px] text-neutral-600">
          <div className="max-w-[70%]">
            <span className="font-semibold text-neutral-800">สินค้าในกล่อง: </span>
            <span>
              {items
                .map((it) => `${it.title} (x${it.quantity})`)
                .slice(0, 3)
                .join(', ')}
              {items.length > 3 ? ` และอีก ${items.length - 3} รายการ` : ''}
            </span>
          </div>
          <div className="flex gap-2">
            <span className="border border-neutral-400 px-1.5 py-0.5 rounded font-bold text-neutral-800">
              ระวังแตก
            </span>
            <span className="border border-neutral-400 px-1.5 py-0.5 rounded font-bold text-neutral-800">
              ห้ามโยน
            </span>
          </div>
        </div>
      </div>

      {/* Dotted Cut Line */}
      <div className="relative my-4 text-center">
        <div className="border-t-2 border-dashed border-neutral-400 w-full absolute top-1/2" />
        <span className="relative bg-white px-3 text-[10px] text-neutral-500 ">
          ✂ ตัดตามรอยประ (แนบใบส่งของด้านล่างในกล่องพัสดุ)
        </span>
      </div>

      {/* ================= SECTION 2: DELIVERY NOTE ================= */}
      <div className="border border-neutral-300 rounded p-4 text-xs">
        <div className="flex justify-between items-start border-b pb-2 mb-3">
          <div>
            <h3 className="font-bold text-sm text-neutral-900">
              ใบส่งของ / รายการจัดส่งสินค้า (Delivery Note)
            </h3>
            <p className="text-neutral-500 text-[11px]">
              คำสั่งซื้อ #{order.orderNumber} | วันที่สั่ง: {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="text-right text-[11px] text-neutral-700">
            <p>
              <span className="font-semibold">ผู้รับ: </span>
              {customer.name}
            </p>
            <p>
              <span className="font-semibold">ขนส่ง: </span>
              {order.shippingMethod || 'Standard'} ({trackingNumber})
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full text-xs border-collapse border border-neutral-300 mb-3">
          <thead>
            <tr className="bg-neutral-100 text-neutral-800 font-semibold border-b border-neutral-300">
              <th className="py-1.5 px-2 text-center border-r border-neutral-300 w-10">ลำดับ</th>
              <th className="py-1.5 px-3 text-left border-r border-neutral-300">รายการสินค้า</th>
              <th className="py-1.5 px-2 text-center border-r border-neutral-300 w-16">จำนวน</th>
              <th className="py-1.5 px-2 text-center border-r border-neutral-300 w-16">หน่วย</th>
              <th className="py-1.5 px-2 text-center w-24">ตรวจสอบ [ ✓ ]</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id || idx} className="border-b border-neutral-200">
                <td className="py-1.5 px-2 text-center border-r border-neutral-300 text-neutral-600">
                  {idx + 1}
                </td>
                <td className="py-1.5 px-3 border-r border-neutral-300">
                  <span className="font-medium text-neutral-900">{item.title}</span>
                  {item.variantTitle && (
                    <span className="text-[11px] text-neutral-500 ml-2">
                      ({item.variantTitle})
                    </span>
                  )}
                  {item.customerNote && (
                    <p className="text-[10px] text-neutral-500 italic">
                      โน้ต: {item.customerNote}
                    </p>
                  )}
                </td>
                <td className="py-1.5 px-2 text-center font-bold border-r border-neutral-300">
                  {item.quantity}
                </td>
                <td className="py-1.5 px-2 text-center text-neutral-600 border-r border-neutral-300">
                  ชิ้น
                </td>
                <td className="py-1.5 px-2 text-center">
                  <span className="inline-block size-3.5 border border-neutral-400 rounded-sm" />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-3 text-center text-xs">
          <div className="space-y-8">
            <p className="font-medium text-neutral-700">ผู้ส่งมอบสินค้า / Dispatcher</p>
            <div className="border-b border-neutral-400 w-40 mx-auto" />
            <p className="text-[10px] text-neutral-500">วันที่ ..... / ..... / .........</p>
          </div>
          <div className="space-y-8">
            <p className="font-medium text-neutral-700">ผู้รับมอบสินค้า / Customer</p>
            <div className="border-b border-neutral-400 w-40 mx-auto" />
            <p className="text-[10px] text-neutral-500">วันที่ ..... / ..... / .........</p>
          </div>
        </div>
      </div>
    </div>
  )
}
