'use client'

import { useMemo } from 'react'

import { formatDateTime } from '@/utils/date'

import { ProductImage } from '../ProductImage'
import { OrderDocComponentProps } from './types'
import { getCustomerInfoFromOrder, getStoreInfoFromOrder } from './utils'

export function PackingSlipDoc({ order }: OrderDocComponentProps) {
  const store = getStoreInfoFromOrder(order)
  const customer = getCustomerInfoFromOrder(order)

  const totalQuantity = useMemo(
    () => order.items.reduce((sum, item) => sum + item.quantity, 0),
    [order.items],
  )

  const formattedOrderDate = useMemo(
    () => (order.createdAt ? formatDateTime(order.createdAt) : '-'),
    [order.createdAt],
  )

  return (
    <div className="mx-auto flex w-full flex-col justify-between bg-white text-xs leading-normal text-neutral-900 print:text-black">
      <div>
        <header className="flex flex-col gap-4 border-b border-neutral-300 pb-5 sm:flex-row sm:items-start sm:justify-between print:flex-row print:items-start print:justify-between">
          <div className="flex items-start gap-4">
            {store.logo && (
              <img
                src={store.logo}
                alt={store.name}
                className="h-16 w-16 border border-neutral-200 object-contain p-1 print:border-none"
              />
            )}
            <div className="space-y-0.5">
              <h1 className="text-base font-semibold text-neutral-950">
                {store.name}
              </h1>
              <p className="text-neutral-600 print:text-neutral-800">
                ฝ่ายคลังสินค้าและจัดเตรียมพัสดุ (Warehouse & Fulfillment)
              </p>
              {store.phone && (
                <p className="text-neutral-500 print:text-neutral-700">
                  โทรศัพท์: {store.phone}
                </p>
              )}
            </div>
          </div>
          <div className="text-left sm:text-right print:text-right">
            <h2 className="text-xl font-bold tracking-tight text-neutral-950">
              ใบจัดสินค้า
            </h2>
            <p className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
              Packing Slip / Pick List
            </p>
            <div className="mt-3 space-y-1">
              <p>
                <span className="text-neutral-500">เลขที่คำสั่งซื้อ: </span>
                <span className="font-semibold text-neutral-950">
                  #{order.orderNumber}
                </span>
              </p>
              <p>
                <span className="text-neutral-500">วันที่สั่งซื้อ: </span>
                <span className="text-neutral-900">{formattedOrderDate}</span>
              </p>
            </div>
          </div>
        </header>
        <section className="mt-5 grid grid-cols-1 gap-3 border border-neutral-300 p-4 sm:grid-cols-3 print:grid-cols-3">
          <div>
            <span className="text-neutral-500">ลูกค้าปลายทาง:</span>
            <p className="pt-0.5 font-semibold text-neutral-950">
              {customer.name}
            </p>
            {customer.phone && customer.phone !== '-' && (
              <p className="text-neutral-700">โทร: {customer.phone}</p>
            )}
          </div>
          <div className="border-t border-neutral-200 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 print:border-t-0 print:border-l print:pt-0 print:pl-4">
            <span className="text-neutral-500">การจัดส่ง:</span>
            <p className="pt-0.5 font-semibold text-neutral-950">
              {order.shippingMethod || 'จัดส่งพัสดุมาตรฐาน'}
            </p>
            <p className="text-neutral-700">
              เลขพัสดุ: {order.trackingNumber || 'รอสร้างเลขพัสดุ'}
            </p>
          </div>
          <div className="border-t border-neutral-200 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 print:border-t-0 print:border-l print:pt-0 print:pl-4">
            <span className="text-neutral-500">สรุปการจัดเตรียม:</span>
            <p className="pt-0.5 font-semibold text-neutral-950">
              {order.items.length} รายการ
            </p>
            <p className="text-neutral-700">
              จำนวนสินค้ารวม: {totalQuantity} ชิ้น
            </p>
          </div>
        </section>
        <section className="mt-5 overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-neutral-400 bg-neutral-100 font-semibold text-neutral-800 print:bg-neutral-50">
                <th className="w-12 px-2 py-2.5 text-center">ตรวจ</th>
                <th className="w-14 px-2 py-2.5 text-center">รูป</th>
                <th className="px-3 py-2.5">สินค้า / รายละเอียด</th>
                <th className="w-28 px-3 py-2.5 text-center">ตัวเลือก</th>
                <th className="w-28 px-3 py-2.5 text-center">คลัง/สาขา</th>
                <th className="w-24 px-3 py-2.5 text-center">จำนวนหยิบ</th>
                <th className="w-36 px-3 py-2.5">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items.map((item) => (
                <tr key={item.id} className="align-middle">
                  <td className="px-2 py-2 text-center">
                    <div className="mx-auto h-4 w-4 border border-neutral-500 bg-white" />
                  </td>
                  <td className="px-2 py-2 text-center">
                    <ProductImage className="size-10 md:size-10" />
                  </td>
                  <td className="max-w-40 min-w-40 px-3 py-2 wrap-break-word whitespace-pre-line">
                    <p className="font-semibold text-neutral-950">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-neutral-500">
                      ID: {item.productId}
                    </p>
                  </td>
                  <td className="max-w-20 min-w-20 px-3 py-2 text-center wrap-break-word whitespace-pre-line text-neutral-700">
                    {item.variantTitle || '-'}
                  </td>
                  <td className="max-w-32 min-w-32 px-3 py-2 text-center wrap-break-word whitespace-pre-line text-neutral-700">
                    {item.branch?.name || 'คลังหลัก'}
                  </td>
                  <td className="max-w-20 min-w-20 px-3 py-2 text-center font-bold wrap-break-word whitespace-pre-line text-neutral-950">
                    {item.quantity}
                  </td>
                  <td className="max-w-20 min-w-20 px-3 py-2 wrap-break-word whitespace-pre-line text-neutral-700">
                    {item.customerNote || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-neutral-400 font-semibold text-neutral-900">
                <td colSpan={5} className="px-3 py-2.5 text-right">
                  จำนวนหยิบรวมทั้งสิ้น:
                </td>
                <td className="px-3 py-2.5 text-center text-sm font-bold">
                  {totalQuantity}
                </td>
                <td className="px-3 py-2.5" />
              </tr>
            </tfoot>
          </table>
        </section>
        <section className="mt-5 border border-neutral-300 p-3 print:bg-transparent">
          <p className="font-semibold text-neutral-900">
            รายการตรวจสอบคุณภาพก่อนปิดกล่อง (Quality Inspection):
          </p>
          <div className="mt-2.5 grid grid-cols-1 gap-2.5 sm:grid-cols-3 print:grid-cols-3">
            <label className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 border border-neutral-500 bg-white" />
              <span>สินค้าถูกต้องและครบตามจำนวน</span>
            </label>
            <label className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 border border-neutral-500 bg-white" />
              <span>สินค้าไม่มีรอยตำหนิและไม่ชำรุด</span>
            </label>
            <label className="flex items-center gap-2">
              <div className="h-3.5 w-3.5 border border-neutral-500 bg-white" />
              <span>ห่อหุ้มกันกระแทกตามเกณฑ์มาตรฐาน</span>
            </label>
          </div>
        </section>
      </div>
      <footer className="mt-14 break-inside-avoid pt-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-12 print:grid-cols-2 print:gap-12">
          <div className="flex flex-col items-center">
            <div className="h-16 w-48 border-b border-neutral-400" />
            <p className="mt-2 font-medium text-neutral-900">
              ผู้หยิบสินค้า / Picked By
            </p>
            <p className="text-[11px] text-neutral-500">
              วันที่: _____/_____/_________
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-16 w-48 border-b border-neutral-400" />
            <p className="mt-2 font-medium text-neutral-900">
              ผู้ตรวจสอบและบรรจุ / Packed By
            </p>
            <p className="text-[11px] text-neutral-500">
              วันที่: _____/_____/_________
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
