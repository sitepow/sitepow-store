'use client'

import { formatDateTime } from '@/utils/date'

import { OrderDocComponentProps } from './types'
import { getCustomerInfoFromOrder, getStoreInfoFromOrder } from './utils'

export function PackingSlipDoc({ order }: OrderDocComponentProps) {
  const store = getStoreInfoFromOrder(order)
  const customer = getCustomerInfoFromOrder(order)

  const totalQuantity = order.items.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  return (
    <div className="mx-auto flex flex-col justify-between bg-white text-sm text-black print:p-0">
      <div>
        <div className="flex items-start justify-between border-b pb-4">
          <div className="flex items-start gap-4">
            {store.logo && (
              <img
                src={store.logo}
                alt={store.name}
                className="h-14 w-14 rounded object-cover"
              />
            )}
            <div>
              <h1 className="text-lg font-bold text-neutral-900">
                {store.name}
              </h1>
              <p className="text-xs text-neutral-500">
                ฝ่ายคลังสินค้าและจัดเตรียมพัสดุ (Warehouse & Fulfillment)
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block rounded bg-amber-500 px-3 py-1 text-base font-bold text-white">
              ใบจัดสินค้า
            </div>
            <p className="text-xs font-medium tracking-wider text-neutral-500 uppercase">
              PACKING SLIP / PICK LIST
            </p>
            <div className="mt-2 space-y-0.5 text-xs">
              <p>
                <span className="text-neutral-500">เลขที่ออเดอร์: </span>
                <span className="font-bold text-neutral-900">
                  #{order.orderNumber}
                </span>
              </p>
              <p>
                <span className="text-neutral-500">วันที่สั่งซื้อ: </span>
                <span>{formatDateTime(order.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 rounded-md border border-neutral-200 bg-neutral-50/60 p-3 text-xs">
          <div>
            <p className="text-neutral-500">ลูกค้าปลายทาง:</p>
            <p className="font-semibold text-neutral-900">{customer.name}</p>
            {customer.phone && customer.phone !== '-' && (
              <p className="text-neutral-600">โทร: {customer.phone}</p>
            )}
          </div>
          <div className="border-l border-neutral-200 pl-4">
            <p className="text-neutral-500">ช่องทางการจัดส่ง:</p>
            <p className="font-semibold text-neutral-900">
              {order.shippingMethod || 'มาตรฐาน'}
            </p>
            {order.trackingNumber && (
              <p className="text-neutral-600">
                เลขพัสดุ: {order.trackingNumber}
              </p>
            )}
          </div>
          <div className="border-l border-neutral-200 pl-4">
            <p className="text-neutral-500">สรุปการจัดเตรียม:</p>
            <p className="font-semibold text-neutral-900">
              {order.items.length} รายการ ({totalQuantity} ชิ้น)
            </p>
          </div>
        </div>
        <div className="mt-5">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-300 bg-neutral-100 font-semibold text-neutral-700">
                <th className="w-12 py-2 pr-2 pl-3 text-center">ตรวจ [✓]</th>
                <th className="w-12 py-2 pr-3 text-center">รูป</th>
                <th className="py-2 pr-4">สินค้า / รหัส</th>
                <th className="py-2 pr-4 text-center">ตัวเลือก</th>
                <th className="py-2 pr-4 text-center">คลัง/สาขา</th>
                <th className="w-20 py-2 pr-4 text-center">จำนวนที่จัด</th>
                <th className="py-2 pr-3">บันทึกพิเศษ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items.map((item) => (
                <tr key={item.id} className="align-middle">
                  <td className="py-2.5 pr-2 pl-3 text-center">
                    <div className="mx-auto h-5 w-5 rounded border-2 border-neutral-400 bg-white" />
                  </td>
                  <td className="py-2.5 pr-3 text-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="mx-auto h-9 w-9 rounded border object-cover"
                      />
                    ) : (
                      <div className="mx-auto flex h-9 w-9 items-center justify-center rounded border bg-neutral-100 text-[10px] text-neutral-400">
                        ไม่มีรูป
                      </div>
                    )}
                  </td>
                  <td className="py-2.5 pr-4">
                    <p className="text-sm font-semibold text-neutral-900">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-neutral-400">
                      ID: {item.productId.slice(0, 12)}...
                    </p>
                  </td>
                  <td className="py-2.5 pr-4 text-center">
                    {item.variantTitle ? (
                      <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-700">
                        {item.variantTitle}
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-center text-neutral-600">
                    {item.branch?.name || 'คลังหลัก'}
                  </td>
                  <td className="py-2.5 pr-4 text-center">
                    <span className="inline-block rounded bg-amber-100 px-3 py-1 text-base font-bold text-amber-900">
                      {item.quantity}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3">
                    {item.customerNote ? (
                      <span className="font-medium text-red-600">
                        {item.customerNote}
                      </span>
                    ) : (
                      <span className="text-neutral-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-6 rounded border border-neutral-200 bg-neutral-50 p-3 text-xs">
          <p className="font-bold text-neutral-800">
            รายการตรวจสอบคุณภาพก่อนปิดกล่อง (Quality Inspection):
          </p>
          <div className="mt-2 grid grid-cols-3 gap-3">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border-2 border-neutral-400" />
              <span>สินค้าครบตามจำนวน</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border-2 border-neutral-400" />
              <span>สินค้าไม่มีรอยตำหนิ/ชำรุด</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded border-2 border-neutral-400" />
              <span>ห่อกันกระแทกเรียบร้อย</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 border-t pt-6">
        <div className="grid grid-cols-2 gap-8 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="h-12 w-52 border-b border-neutral-400" />
            <p className="mt-1.5 font-medium text-neutral-700">
              ผู้หยิบสินค้า / Picked By
            </p>
            <p className="text-xs text-neutral-400">
              วันที่: ____/____/________
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 w-52 border-b border-neutral-400" />
            <p className="mt-1.5 font-medium text-neutral-700">
              ผู้ตรวจสอบและบรรจุ / Packed By
            </p>
            <p className="text-xs text-neutral-400">
              วันที่: ____/____/________
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
