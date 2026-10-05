'use client'

import React from 'react'
import Image from 'next/image'
import { GetOrdersItem } from '@/actions/sales/order/actions'
import { formatDateTime } from '@/utils/formatting/date'
import { formatNumber } from '@/utils/formatting/number'
import { BarcodeSvg } from './BarcodeSvg'
import {
  DocumentOptions,
  extractCustomerDocumentInfo,
  extractStoreDocumentInfo,
} from './types'

interface PickingPackingDocumentProps {
  order: GetOrdersItem
  options: DocumentOptions
}

export function PickingPackingDocument({
  order,
  options,
}: PickingPackingDocumentProps) {
  const store = extractStoreDocumentInfo(order)
  const customer = extractCustomerDocumentInfo(order)

  const items = order.items || []
  const totalQuantity = items.reduce((sum, it) => sum + it.quantity, 0)

  return (
    <div className="w-full bg-white text-neutral-900 p-8 font-sans print:p-0 print:text-black">
      {/* Header Row */}
      <div className="flex items-start justify-between border-b-2 border-neutral-900 pb-4 mb-4">
        <div>
          <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            {store.name}
          </span>
          <h1 className="text-xl font-extrabold text-neutral-900 tracking-tight">
            ใบจัดสินค้าและแพ็คสินค้า (Picking & Packing List)
          </h1>
          <p className="text-xs text-neutral-600 mt-0.5">
            วันที่สั่งซื้อ: {formatDateTime(order.createdAt)}
          </p>
        </div>

        {/* Order Barcode */}
        <div className="text-right">
          <BarcodeSvg
            value={order.orderNumber}
            height={44}
            moduleWidth={1.4}
            showText={true}
          />
        </div>
      </div>

      {/* Meta Box Grid */}
      <div className="grid grid-cols-3 gap-3 border border-neutral-300 rounded p-3 mb-4 text-xs">
        <div>
          <span className="font-semibold text-neutral-500 block text-[10px] uppercase">
            ลูกค้า / ผู้สั่งซื้อ
          </span>
          <p className="font-bold text-neutral-900 text-sm mt-0.5">
            {customer.name}
          </p>
          {customer.phone !== '-' && (
            <p className="text-neutral-700">{customer.phone}</p>
          )}
        </div>

        <div>
          <span className="font-semibold text-neutral-500 block text-[10px] uppercase">
            ช่องทางการจัดส่ง & ขนส่ง
          </span>
          <p className="font-bold text-neutral-900 mt-0.5">
            {order.shippingMethod || 'จัดส่งมาตรฐาน'}
          </p>
          {order.trackingNumber && (
            <p className="text-neutral-700 font-mono">
              Track: {order.trackingNumber}
            </p>
          )}
        </div>

        <div>
          <span className="font-semibold text-neutral-500 block text-[10px] uppercase">
            ขนาดและน้ำหนักพัสดุ
          </span>
          <p className="font-medium text-neutral-800 mt-0.5">
            น้ำหนักรวม: {formatNumber(order.totalWeight || 0)} กก.
          </p>
          <p className="text-neutral-600 text-[11px]">
            ขนาด (กxยxส): {formatNumber(order.width || 0)} x {formatNumber(order.length || 0)} x {formatNumber(order.height || 0)} ซม.
          </p>
        </div>
      </div>

      {/* Picking Items Table */}
      <table className="w-full text-xs border-collapse border border-neutral-300 mb-4">
        <thead>
          <tr className="bg-neutral-100 text-neutral-800 font-semibold border-b border-neutral-300 print:bg-neutral-200">
            <th className="py-2 px-2.5 text-center border-r border-neutral-300 w-12">ลำดับ</th>
            <th className="py-2 px-2 text-center border-r border-neutral-300 w-16">รูปภาพ</th>
            <th className="py-2 px-3 text-left border-r border-neutral-300">ชื่อสินค้า / ตัวเลือกสินค้า</th>
            <th className="py-2 px-2 text-center border-r border-neutral-300 w-28">สาขา / คลังจัดเก็บ</th>
            <th className="py-2 px-2.5 text-center border-r border-neutral-300 w-20">จำนวนที่ต้องหยิบ</th>
            <th className="py-2 px-2 text-center w-20">ตรวจหยิบ [✓]</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, idx) => (
            <tr
              key={item.id || idx}
              className="border-b border-neutral-200 text-neutral-800"
            >
              <td className="py-2.5 px-2.5 text-center border-r border-neutral-300 text-neutral-600 font-medium">
                {idx + 1}
              </td>
              <td className="py-2 px-2 text-center border-r border-neutral-300">
                {item.image ? (
                  <div className="relative size-10 mx-auto rounded border border-neutral-200 overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="size-10 mx-auto rounded bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[9px] text-neutral-400">
                    No Img
                  </div>
                )}
              </td>
              <td className="py-2.5 px-3 border-r border-neutral-300">
                <div className="font-bold text-neutral-900 text-sm">
                  {item.title}
                </div>
                {item.variantTitle && (
                  <div className="text-xs text-neutral-700 font-medium mt-0.5">
                    ตัวเลือก: <span className="bg-neutral-100 px-1 py-0.5 rounded border border-neutral-200">{item.variantTitle}</span>
                  </div>
                )}
                {item.customerNote && (
                  <div className="text-[11px] text-amber-700 bg-amber-50 p-1 rounded mt-1 border border-amber-200">
                    ⚠ โน้ตจากลูกค้า: {item.customerNote}
                  </div>
                )}
              </td>
              <td className="py-2.5 px-2 text-center border-r border-neutral-300 text-neutral-700">
                {item.branch?.name || 'คลังหลัก'}
              </td>
              <td className="py-2.5 px-2.5 text-center border-r border-neutral-300">
                <span className="inline-block text-base font-extrabold text-neutral-900 px-2 py-0.5 bg-neutral-100 rounded border border-neutral-300">
                  {item.quantity}
                </span>
              </td>
              <td className="py-2.5 px-2 text-center">
                <span className="inline-block size-5 border-2 border-neutral-600 rounded" />
              </td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr className="bg-neutral-50 font-bold border-t-2 border-neutral-300">
            <td colSpan={4} className="py-2 px-3 text-right border-r border-neutral-300">
              รวมจำนวนสินค้าทั้งหมดที่ต้องหยิบ (Total Pick Quantity):
            </td>
            <td className="py-2 px-2.5 text-center text-sm border-r border-neutral-300 font-extrabold text-neutral-900">
              {totalQuantity} ชิ้น
            </td>
            <td className="py-2 px-2 text-center">
              <span className="text-[10px] text-neutral-500 font-normal">ครบถ้วน</span>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Custom Note or Packing memo */}
      {options.customNote && (
        <div className="border border-neutral-300 rounded p-3 mb-6 text-xs">
          <span className="font-bold text-neutral-800">หมายเหตุพิเศษในการแพ็ค:</span>
          <p className="text-neutral-700 mt-0.5 whitespace-pre-line">
            {options.customNote}
          </p>
        </div>
      )}

      {/* Staff Signatures */}
      {options.showSignatures && (
        <div className="grid grid-cols-2 gap-8 pt-4 border-t border-neutral-300 print-avoid-break text-xs text-center">
          <div className="space-y-10">
            <p className="font-medium text-neutral-800">
              ผู้จัดสินค้า (Picked By)
            </p>
            <div className="border-b border-neutral-400 w-48 mx-auto" />
            <p className="text-neutral-500 text-[11px]">วันที่ ..... / ..... / ......... เวลา .......:.......</p>
          </div>
          <div className="space-y-10">
            <p className="font-medium text-neutral-800">
              ผู้ตรวจสอบและแพ็ค (Packed & Checked By)
            </p>
            <div className="border-b border-neutral-400 w-48 mx-auto" />
            <p className="text-neutral-500 text-[11px]">วันที่ ..... / ..... / ......... เวลา .......:.......</p>
          </div>
        </div>
      )}
    </div>
  )
}
