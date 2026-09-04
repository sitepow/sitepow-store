'use client'

import { PAYMENT_METHOD_TH } from '@/constants/translate'
import { thaiBahtText } from '@/utils/baht-text'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import { formatPromptPay } from '@/utils/slip'

import { OrderDocComponentProps } from './types'
import { getCustomerInfoFromOrder, getStoreInfoFromOrder } from './utils'

export function TaxInvoiceDoc({ order }: OrderDocComponentProps) {
  const store = getStoreInfoFromOrder(order)
  const defaultCustomer = getCustomerInfoFromOrder(order)

  const customerName = order.taxName || defaultCustomer.name
  const customerTaxId = order.taxId || '-'
  const customerBranch = order.taxBranchCode || 'สำนักงานใหญ่'
  const customerAddress = order.taxAddress || defaultCustomer.fullAddress

  const totalAmount = Number(order.totalAmount)

  const isVatRegistered = (order as any).store?.isVatRegistered ?? true
  const vatRate = Number((order as any).store?.vatRate || 7)

  const totalBeforeVat = isVatRegistered
    ? totalAmount / (1 + vatRate / 100)
    : totalAmount
  const vatAmount = totalAmount - totalBeforeVat

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
                สำนักงานใหญ่ (Head Office)
              </p>
              {store.address && (
                <p className="mt-0.5 text-xs text-neutral-600">
                  {store.address}
                </p>
              )}
              <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-neutral-600">
                <span>
                  เลขประจำตัวผู้เสียภาษี:{' '}
                  <span className="font-semibold">
                    {store.taxId
                      ? formatPromptPay(store.taxId)
                      : '0-0000-00000-00-0'}
                  </span>
                </span>
                {store.phone && <span>โทร: {store.phone}</span>}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block rounded bg-neutral-900 px-3 py-1 text-base font-bold text-white">
              ใบกำกับภาษี / ใบเสร็จรับเงิน
            </div>
            <p className="text-xs font-medium tracking-wider text-neutral-500 uppercase">
              TAX INVOICE / RECEIPT
            </p>
            <div className="mt-2 space-y-0.5 text-xs">
              <p>
                <span className="text-neutral-500">เลขที่: </span>
                <span className="font-bold">TAX-{order.orderNumber}</span>
              </p>
              <p>
                <span className="text-neutral-500">อ้างอิงออเดอร์: </span>
                <span className="font-medium">#{order.orderNumber}</span>
              </p>
              <p>
                <span className="text-neutral-500">วันที่ออกเอกสาร: </span>
                <span>{formatDateTime(order.paidAt || order.createdAt)}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-4 rounded-md border border-neutral-200 bg-neutral-50/60 p-3 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-neutral-500">ชื่อผู้ซื้อ / ผู้รับบริการ:</p>
              <p className="text-sm font-semibold text-neutral-900">
                {customerName}
              </p>
              <p className="mt-1 text-neutral-500">ที่อยู่จดทะเบียนภาษี:</p>
              <p className="text-neutral-700">{customerAddress}</p>
            </div>

            <div className="space-y-1 border-l border-neutral-200 pl-4">
              <p>
                <span className="text-neutral-500">
                  เลขประจำตัวผู้เสียภาษีอากร:{' '}
                </span>
                <span className="font-mono font-semibold text-neutral-900">
                  {customerTaxId !== '-'
                    ? formatPromptPay(customerTaxId)
                    : 'ไม่ได้ระบุ'}
                </span>
              </p>
              <p>
                <span className="text-neutral-500">สาขา: </span>
                <span className="font-medium text-neutral-800">
                  {customerBranch}
                </span>
              </p>
              <p>
                <span className="text-neutral-500">วิธีชำระเงิน: </span>
                <span className="text-neutral-800">
                  {order.paymentMethod
                    ? (PAYMENT_METHOD_TH as any)[order.paymentMethod] ||
                      order.paymentMethod
                    : 'เงินสด/โอน'}
                </span>
              </p>
            </div>
          </div>
        </div>
        <div className="mt-5">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-neutral-300 bg-neutral-100 font-semibold text-neutral-700">
                <th className="py-2 pr-2 pl-3 text-center">ลำดับ</th>
                <th className="py-2 pr-4">รายการ</th>
                <th className="py-2 pr-4 text-center">จำนวน</th>
                <th className="py-2 pr-4 text-right">ราคาต่อหน่วย</th>
                <th className="py-2 pr-3 text-right">จำนวนเงิน</th>
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
            <div className="max-w-[55%] space-y-2">
              <div className="rounded bg-neutral-50 p-2.5 text-xs">
                <span className="font-semibold text-neutral-600">
                  จำนวนเงินรวมทั้งสิ้น (ตัวอักษร):{' '}
                </span>
                <p className="mt-0.5 text-sm font-medium text-neutral-900">
                  {thaiBahtText(totalAmount)}
                </p>
              </div>
              <p className="text-xs text-neutral-400">
                * ราคาสินค้ารวมภาษีมูลค่าเพิ่มแล้ว (VAT Included)
              </p>
            </div>
            <div className="w-[42%] space-y-1.5 text-xs">
              <div className="flex justify-between text-neutral-600">
                <span>มูลค่าสินค้าตามเอกสาร:</span>
                <span>
                  {formatCurrency(
                    order.items.reduce(
                      (s, i) => s + Number(i.price) * i.quantity,
                      0,
                    ),
                  )}
                </span>
              </div>
              {Number(order.pointsDiscount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>หัก ส่วนลดแต้มสะสม:</span>
                  <span>-{formatCurrency(Number(order.pointsDiscount))}</span>
                </div>
              )}
              {order.coupon && Number(order.coupon.discountAmount || 0) > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>หัก ส่วนลดคูปอง:</span>
                  <span>
                    -{formatCurrency(Number(order.coupon.discountAmount))}
                  </span>
                </div>
              )}
              {Number(order.shippingFee || 0) > 0 && (
                <div className="flex justify-between text-neutral-600">
                  <span>ค่าบริการจัดส่ง:</span>
                  <span>{formatCurrency(Number(order.shippingFee))}</span>
                </div>
              )}
              <div className="border-t border-neutral-200 pt-1.5">
                <div className="flex justify-between text-neutral-600">
                  <span>มูลค่าสินค้าก่อนภาษีมูลค่าเพิ่ม:</span>
                  <span>{formatCurrency(totalBeforeVat)}</span>
                </div>
                <div className="mt-1 flex justify-between text-neutral-600">
                  <span>ภาษีมูลค่าเพิ่ม ({vatRate}%):</span>
                  <span>{formatCurrency(vatAmount)}</span>
                </div>
              </div>
              <div className="flex justify-between border-t border-neutral-300 pt-2 text-sm font-bold text-neutral-900">
                <span>ยอดเงินสุทธิรวมภาษี:</span>
                <span className="text-primary text-base">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-12 border-t pt-6">
        <div className="grid grid-cols-2 gap-8 text-center text-xs">
          <div className="flex flex-col items-center">
            <div className="h-12 w-52 border-b border-neutral-400" />
            <p className="mt-1.5 font-medium text-neutral-700">
              ผู้รับเอกสาร / ผู้ซื้อ
            </p>
            <p className="text-xs text-neutral-400">
              วันที่: ____/____/________
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-12 w-52 border-b border-neutral-400" />
            <p className="mt-1.5 font-medium text-neutral-700">
              ผู้มีอำนาจลงนาม / ในนามผู้ขาย
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
