'use client'

import { PAYMENT_METHOD_TH } from '@/constants/translate'
import { thaiBahtText } from '@/utils/baht-text'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'

import { OrderDocComponentProps } from './types'
import { getCustomerInfoFromOrder, getStoreInfoFromOrder } from './utils'

export function ReceiptDoc({ order }: OrderDocComponentProps) {
  const store = getStoreInfoFromOrder(order)
  const customer = getCustomerInfoFromOrder(order)

  const itemsSubtotal = order.items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0,
  )

  const isPaid = order.status === 'PAID' || order.status === 'SHIPPED'

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
                {store.taxId && (
                  <span>เลขประจำตัวผู้เสียภาษี: {store.taxId}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block rounded bg-neutral-100 px-3 py-1 text-base font-bold text-neutral-800">
              ใบเสร็จรับเงิน
            </div>
            <p className="text-xs font-medium tracking-wider text-neutral-400 uppercase">
              RECEIPT
            </p>
            <div className="mt-2 space-y-0.5 text-xs">
              <p>
                <span className="text-neutral-500">เลขที่ใบเสร็จ: </span>
                <span className="font-semibold">REC-{order.orderNumber}</span>
              </p>
              <p>
                <span className="text-neutral-500">เลขที่คำสั่งซื้อ: </span>
                <span className="font-medium">#{order.orderNumber}</span>
              </p>
              <p>
                <span className="text-neutral-500">วันที่: </span>
                <span>{formatDateTime(order.paidAt || order.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4 rounded-md border border-neutral-200 bg-neutral-50/50 p-3 text-xs">
          <div>
            <h3 className="font-semibold text-neutral-700">ข้อมูลลูกค้า</h3>
            <p className="mt-1 font-medium text-neutral-900">{customer.name}</p>
            {customer.phone && customer.phone !== '-' && (
              <p className="text-neutral-600">เบอร์โทร: {customer.phone}</p>
            )}
            {customer.email && customer.email !== '-' && (
              <p className="text-neutral-600">อีเมล: {customer.email}</p>
            )}
            {customer.fullAddress && customer.fullAddress !== '-' && (
              <p className="text-neutral-600">
                ที่อยู่: {customer.fullAddress}
              </p>
            )}
          </div>
          <div className="border-l border-neutral-200 pl-4">
            <h3 className="font-semibold text-neutral-700">
              ข้อมูลการชำระเงิน
            </h3>
            <p className="mt-1">
              <span className="text-neutral-500">วิธีชำระเงิน: </span>
              <span className="font-medium">
                {order.paymentMethod
                  ? (PAYMENT_METHOD_TH as any)[order.paymentMethod] ||
                    order.paymentMethod
                  : 'ไม่ระบุ'}
              </span>
            </p>
            {order.paidAt && (
              <p className="mt-0.5">
                <span className="text-neutral-500">ชำระเมื่อ: </span>
                <span>{formatDateTime(order.paidAt)}</span>
              </p>
            )}
            {order.transactionId && (
              <p className="mt-0.5 text-neutral-600">
                <span className="text-neutral-500">รหัสธุรกรรม: </span>
                <span>{order.transactionId}</span>
              </p>
            )}
          </div>
        </div>
        <div className="mt-5">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-300 bg-neutral-100 font-semibold text-neutral-700">
                <th className="py-2 pr-2 pl-3 text-center">#</th>
                <th className="py-2 pr-4">รายการสินค้า</th>
                <th className="py-2 pr-4 text-center">จำนวน</th>
                <th className="py-2 pr-4 text-right">ราคา/หน่วย</th>
                <th className="py-2 pr-3 text-right">รวมเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items.map((item, index) => {
                const itemTotal = Number(item.price) * item.quantity
                return (
                  <tr key={item.id} className="align-top">
                    <td className="py-2 pr-2 pl-3 text-center text-neutral-500">
                      {index + 1}
                    </td>
                    <td className="py-2 pr-4">
                      <p className="font-medium text-neutral-900">
                        {item.title}
                      </p>
                      {item.variantTitle && (
                        <p className="text-xs text-neutral-500">
                          ตัวเลือก: {item.variantTitle}
                        </p>
                      )}
                      {item.customerNote && (
                        <p className="text-xs text-amber-700">
                          หมายเหตุ: {item.customerNote}
                        </p>
                      )}
                    </td>
                    <td className="py-2 pr-4 text-center font-medium">
                      {item.quantity}
                    </td>
                    <td className="py-2 pr-4 text-right">
                      {formatCurrency(Number(item.price))}
                    </td>
                    <td className="py-2 pr-3 text-right font-medium">
                      {formatCurrency(itemTotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div className="mt-4 border-t pt-4">
          <div className="flex items-start justify-between">
            <div className="max-w-[55%] space-y-1">
              <div className="rounded bg-neutral-50 p-2 text-xs">
                <span className="font-semibold text-neutral-600">
                  จำนวนเงินตัวอักษร:{' '}
                </span>
                <span className="font-medium text-neutral-900">
                  {thaiBahtText(order.totalAmount)}
                </span>
              </div>
              {isPaid && (
                <div className="mt-3 inline-flex items-center gap-1.5 rounded border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
                  <span>✓ ชำระเงินเรียบร้อยแล้ว (PAID)</span>
                </div>
              )}
            </div>
            <div className="w-[40%] space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>รวมราคาสินค้า:</span>
                <span>{formatCurrency(itemsSubtotal)}</span>
              </div>
              {Number(order.pointsDiscount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>ส่วนลดจากแต้มสะสม:</span>
                  <span>-{formatCurrency(Number(order.pointsDiscount))}</span>
                </div>
              )}
              {order.coupon && Number(order.coupon.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>ส่วนลดคูปอง ({order.coupon.code}):</span>
                  <span>
                    -{formatCurrency(Number(order.coupon.discountAmount))}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600">
                <span>ค่าจัดส่ง:</span>
                <span>
                  {Number(order.shippingFee || 0) > 0
                    ? formatCurrency(Number(order.shippingFee))
                    : 'ฟรี'}
                </span>
              </div>

              <div className="flex justify-between border-t border-neutral-300 pt-2 text-sm font-bold text-neutral-900">
                <span>ยอดรวมทั้งสิ้น:</span>
                <span className="text-primary text-base">
                  {formatCurrency(Number(order.totalAmount))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-10 border-t pt-6">
        <div className="grid grid-cols-2 gap-8 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="h-12 w-48 border-b border-neutral-400" />
            <p className="mt-1.5 font-medium text-neutral-700">
              ผู้รับเงิน / Cashier
            </p>
            <p className="text-xs text-neutral-400">
              วันที่: ____/____/________
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 w-48 border-b border-neutral-400" />
            <p className="mt-1.5 font-medium text-neutral-700">
              ผู้มีอำนาจลงนาม
            </p>
            <p className="text-xs text-neutral-400">
              วันที่: ____/____/________
            </p>
          </div>
        </div>
        <p className="mt-6 text-center text-xs text-neutral-400">
          เอกสารนี้ออกโดยระบบอัตโนมัติ • ขอบคุณที่ไว้วางใจใช้บริการ
        </p>
      </div>
    </div>
  )
}
