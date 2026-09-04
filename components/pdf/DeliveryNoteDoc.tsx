'use client'

import { useMemo } from 'react'

import { formatDateTime } from '@/utils/date'

import { OrderDocComponentProps } from './types'
import { getCustomerInfoFromOrder, getStoreInfoFromOrder } from './utils'

export function DeliveryNoteDoc({ order }: OrderDocComponentProps) {
  const store = getStoreInfoFromOrder(order)
  const customer = getCustomerInfoFromOrder(order)

  const totalQuantity = useMemo(
    () => order.items.reduce((sum, item) => sum + item.quantity, 0),
    [order.items],
  )

  const currentDate = useMemo(() => formatDateTime(new Date()), [])

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
              {store.address && (
                <p className="max-w-md text-neutral-600 print:text-neutral-800">
                  {store.address}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 pt-1 text-neutral-600 print:text-neutral-800">
                {store.phone && <span>โทรศัพท์: {store.phone}</span>}
                {store.email && <span>อีเมล: {store.email}</span>}
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right print:text-right">
            <h2 className="text-xl font-bold tracking-tight text-neutral-950">
              ใบส่งสินค้า
            </h2>
            <p className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
              Delivery Note
            </p>
            <div className="mt-3 space-y-1">
              <p>
                <span className="text-neutral-500">เลขที่เอกสาร: </span>
                <span className="font-semibold text-neutral-950">
                  DN-{order.orderNumber}
                </span>
              </p>
              <p>
                <span className="text-neutral-500">อ้างอิงคำสั่งซื้อ: </span>
                <span className="font-medium text-neutral-900">
                  #{order.orderNumber}
                </span>
              </p>
              <p>
                <span className="text-neutral-500">วันที่: </span>
                <span className="text-neutral-900">{currentDate}</span>
              </p>
            </div>
          </div>
        </header>
        <section className="mt-5 grid grid-cols-1 gap-4 border border-neutral-300 p-4 sm:grid-cols-2 print:grid-cols-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-neutral-900">
              สถานที่จัดส่ง (Recipient)
            </h3>
            <p className="pt-1 font-semibold text-neutral-950">
              {customer.name}
            </p>
            {customer.phone && customer.phone !== '-' && (
              <p className="text-neutral-800">
                เบอร์โทรศัพท์: {customer.phone}
              </p>
            )}
            <p className="pt-0.5 leading-relaxed text-neutral-700 print:text-neutral-900">
              ที่อยู่: {customer.fullAddress}
            </p>
          </div>
          <div className="space-y-1 border-t border-neutral-200 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 print:border-t-0 print:border-l print:pt-0 print:pl-4">
            <h3 className="font-semibold text-neutral-900">
              รายละเอียดการขนส่ง (Shipping Details)
            </h3>
            <p className="pt-1">
              <span className="text-neutral-500">วิธีการจัดส่ง: </span>
              <span className="font-medium text-neutral-900">
                {order.shippingMethod || 'จัดส่งพัสดุมาตรฐาน'}
              </span>
            </p>
            <p>
              <span className="text-neutral-500">
                เลขพัสดุ (Tracking No.):{' '}
              </span>
              <span className="font-semibold text-neutral-950">
                {order.trackingNumber || 'รอจัดส่ง'}
              </span>
            </p>
            {order.totalWeight && (
              <p>
                <span className="text-neutral-500">น้ำหนักรวม: </span>
                <span className="text-neutral-900">
                  {order.totalWeight} กก.
                </span>
              </p>
            )}
            <p>
              <span className="text-neutral-500">จำนวนรวมทั้งสิ้น: </span>
              <span className="font-medium text-neutral-950">
                {totalQuantity} รายการ
              </span>
            </p>
          </div>
        </section>
        <section className="mt-5 overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-neutral-400 bg-neutral-100 font-semibold text-neutral-800 print:bg-neutral-50">
                <th className="w-12 px-2 py-2.5 text-center">ลำดับ</th>
                <th className="px-3 py-2.5">รายการสินค้า</th>
                <th className="w-32 px-3 py-2.5 text-center">ตัวเลือก</th>
                <th className="w-24 px-3 py-2.5 text-center">จำนวนส่ง</th>
                <th className="w-36 px-3 py-2.5">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items.map((item, index) => (
                <tr key={item.id} className="align-top">
                  <td className="px-2 py-2.5 text-center text-neutral-500">
                    {index + 1}
                  </td>
                  <td className="max-w-72 min-w-72 px-3 py-2.5 wrap-break-word whitespace-pre-line">
                    <span className="font-medium text-neutral-900">
                      {item.title}
                    </span>
                  </td>
                  <td className="max-w-20 min-w-20 px-3 py-2.5 text-center wrap-break-word whitespace-pre-line text-neutral-600 print:text-neutral-900">
                    {item.variantTitle || '-'}
                  </td>
                  <td className="max-w-20 min-w-20 px-3 py-2.5 text-center font-semibold wrap-break-word whitespace-pre-line text-neutral-950">
                    {item.quantity}
                  </td>
                  <td className="max-w-20 min-w-20 px-3 py-2.5 wrap-break-word whitespace-pre-line text-neutral-500 print:text-neutral-800">
                    {item.customerNote || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-neutral-400 font-semibold text-neutral-900">
                <td colSpan={3} className="px-3 py-2.5 text-right">
                  ยอดรวมจำนวนสินค้าทั้งสิ้น:
                </td>
                <td className="px-3 py-2.5 text-center text-sm font-bold">
                  {totalQuantity}
                </td>
                <td className="px-3 py-2.5" />
              </tr>
            </tfoot>
          </table>
        </section>
        <section className="mt-4 border-l-2 border-neutral-400 bg-neutral-50 px-3 py-2 text-[11px] text-neutral-600 print:bg-transparent print:text-neutral-800">
          <p className="font-semibold text-neutral-800">
            ข้อควรปฏิบัติในการรับพัสดุ:
          </p>
          <p className="mt-0.5">
            กรุณาตรวจนับจำนวนสินค้าและตรวจสภาพบรรจุภัณฑ์ก่อนเซ็นชื่อรับมอบ
            หากพบสิ่งผิดปกติหรือสินค้าขาดหาย
            กรุณาบันทึกข้อมูลร่วมกับเจ้าหน้าที่ขนส่งทันที
          </p>
        </section>
      </div>
      <footer className="mt-14 break-inside-avoid pt-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-12 print:grid-cols-2 print:gap-12">
          <div className="flex flex-col items-center">
            <div className="h-16 w-48 border-b border-neutral-400" />
            <p className="mt-2 font-medium text-neutral-900">
              ผู้จัดส่ง / Delivered By
            </p>
            <p className="text-[11px] text-neutral-500">
              วันที่: _____/_____/_________
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-16 w-48 border-b border-neutral-400" />
            <p className="mt-2 font-medium text-neutral-900">
              ผู้รับสินค้า / Received By (ลายเซ็นและชื่อบรรจง)
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
