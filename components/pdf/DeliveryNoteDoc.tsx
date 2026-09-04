'use client'

import { formatDateTime } from '@/utils/date'

import { OrderDocComponentProps } from './types'
import { getCustomerInfoFromOrder, getStoreInfoFromOrder } from './utils'

export function DeliveryNoteDoc({ order }: OrderDocComponentProps) {
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
              {store.address && (
                <p className="text-xs text-neutral-600">{store.address}</p>
              )}
              <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-neutral-500">
                {store.phone && <span>โทร: {store.phone}</span>}
                {store.email && <span>อีเมล: {store.email}</span>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block rounded bg-neutral-800 px-3 py-1 text-base font-bold text-white">
              ใบส่งสินค้า
            </div>
            <p className="text-xs font-medium tracking-wider text-neutral-500 uppercase">
              DELIVERY NOTE
            </p>
            <div className="mt-2 space-y-0.5 text-xs">
              <p>
                <span className="text-neutral-500">เลขที่ใบส่งสินค้า: </span>
                <span className="font-bold">DN-{order.orderNumber}</span>
              </p>
              <p>
                <span className="text-neutral-500">เลขที่คำสั่งซื้อ: </span>
                <span className="font-medium">#{order.orderNumber}</span>
              </p>
              <p>
                <span className="text-neutral-500">วันที่: </span>
                <span>{formatDateTime(new Date())}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 rounded-md border border-neutral-200 bg-neutral-50/50 p-3 text-xs">
          <div>
            <h3 className="font-semibold text-neutral-700">
              สถานที่จัดส่ง (ปลายทาง)
            </h3>
            <p className="mt-1 text-sm font-semibold text-neutral-900">
              {customer.name}
            </p>
            {customer.phone && customer.phone !== '-' && (
              <p className="mt-0.5 font-medium text-neutral-800">
                เบอร์โทรศัพท์: {customer.phone}
              </p>
            )}
            <p className="mt-1 leading-relaxed text-neutral-700">
              ที่อยู่จัดส่ง: {customer.fullAddress}
            </p>
          </div>

          <div className="space-y-1 border-l border-neutral-200 pl-4">
            <h3 className="font-semibold text-neutral-700">ข้อมูลการจัดส่ง</h3>
            <p className="mt-1">
              <span className="text-neutral-500">ช่องทางการจัดส่ง: </span>
              <span className="font-medium text-neutral-900">
                {order.shippingMethod || 'จัดส่งพัสดุมาตรฐาน'}
              </span>
            </p>
            <p>
              <span className="text-neutral-500">
                เลขพัสดุ (Tracking No.):{' '}
              </span>
              <span className="font-mono font-bold text-neutral-900">
                {order.trackingNumber || 'รอจัดส่ง'}
              </span>
            </p>
            {order.totalWeight && (
              <p>
                <span className="text-neutral-500">น้ำหนักรวม: </span>
                <span>{order.totalWeight} กก.</span>
              </p>
            )}
            <p>
              <span className="text-neutral-500">จำนวนสินค้ารวม: </span>
              <span className="font-medium">{totalQuantity} ชิ้น</span>
            </p>
          </div>
        </div>
        <div className="mt-5">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-300 bg-neutral-100 font-semibold text-neutral-700">
                <th className="py-2 pr-2 pl-3 text-center">ลำดับ</th>
                <th className="py-2 pr-4">รายการสินค้า</th>
                <th className="py-2 pr-4 text-center">ตัวเลือก</th>
                <th className="py-2 pr-4 text-center">จำนวนที่ส่ง</th>
                <th className="py-2 pr-3">หมายเหตุ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items.map((item, index) => (
                <tr key={item.id} className="align-top">
                  <td className="py-2.5 pr-2 pl-3 text-center text-neutral-500">
                    {index + 1}
                  </td>
                  <td className="py-2.5 pr-4">
                    <p className="font-medium text-neutral-900">{item.title}</p>
                  </td>
                  <td className="py-2.5 pr-4 text-center text-neutral-600">
                    {item.variantTitle || '-'}
                  </td>
                  <td className="py-2.5 pr-4 text-center text-sm font-bold text-neutral-900">
                    {item.quantity}
                  </td>
                  <td className="py-2.5 pr-3 text-neutral-500">
                    {item.customerNote || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-neutral-300 bg-neutral-50 font-semibold text-neutral-800">
                <td colSpan={3} className="py-2 pr-4 pl-3 text-right">
                  รวมจำนวนสินค้าทั้งหมด:
                </td>
                <td className="py-2 pr-4 text-center text-sm font-bold">
                  {totalQuantity} ชิ้น
                </td>
                <td className="py-2 pr-3" />
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="mt-4 rounded border border-amber-200 bg-amber-50/50 p-2.5 text-xs text-neutral-600">
          <p className="font-medium text-amber-900">ข้อควรทราบ:</p>
          <p className="mt-0.5">
            กรุณาตรวจสอบสภาพพัสดุและจำนวนสินค้าให้ถูกต้องครบถ้วนก่อนลงชื่อรับสินค้า
            หากพบความเสียหายหรือสินค้าไม่ครบถ้วน กรุณาแจ้งกลับผู้จัดส่งทันที
          </p>
        </div>
      </div>
      <div className="mt-12 border-t pt-6">
        <div className="grid grid-cols-2 gap-8 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="h-14 w-52 border-b border-neutral-400" />
            <p className="mt-1.5 font-medium text-neutral-800">
              ผู้จัดส่ง / Shipped By
            </p>
            <p className="text-xs text-neutral-500">
              วันที่: ____/____/________
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-14 w-52 border-b border-neutral-400" />
            <p className="mt-1.5 font-medium text-neutral-800">
              ผู้รับสินค้า / Received By (ลายเซ็นและชื่อตัวบรรจง)
            </p>
            <p className="text-xs text-neutral-500">
              วันที่ได้รับ: ____/____/________
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
