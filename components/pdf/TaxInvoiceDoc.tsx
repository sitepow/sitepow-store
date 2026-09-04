'use client'

import { useMemo } from 'react'

import { PAYMENT_METHOD_TH } from '@/constants/translate'
import { thaiBahtText } from '@/utils/baht-text'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import { formatPromptPay } from '@/utils/slip'

import { OrderDocComponentProps } from './types'
import { getCustomerInfoFromOrder, getStoreInfoFromOrder } from './utils'

interface ExtendedOrderProps {
  store?: {
    isVatRegistered?: boolean
    vatRate?: number | string
  }
}

export function TaxInvoiceDoc({ order }: OrderDocComponentProps) {
  const store = getStoreInfoFromOrder(order)
  const defaultCustomer = getCustomerInfoFromOrder(order)
  const extendedOrder = order as typeof order & ExtendedOrderProps

  const customerName = order.taxName || defaultCustomer.name
  const customerTaxId = order.taxId || '-'
  const customerBranch = order.taxBranchCode || 'สำนักงานใหญ่'
  const customerAddress = order.taxAddress || defaultCustomer.fullAddress

  const totalAmount = Number(order.totalAmount || 0)
  const isVatRegistered = extendedOrder.store?.isVatRegistered ?? true
  const vatRate = Number(extendedOrder.store?.vatRate || 7)

  const itemsSubtotal = useMemo(
    () =>
      order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      ),
    [order.items],
  )

  const { totalBeforeVat, vatAmount } = useMemo(() => {
    const beforeVat = isVatRegistered
      ? totalAmount / (1 + vatRate / 100)
      : totalAmount
    const vat = totalAmount - beforeVat
    return { totalBeforeVat: beforeVat, vatAmount: vat }
  }, [totalAmount, isVatRegistered, vatRate])

  const documentDate = useMemo(
    () => formatDateTime(order.paidAt || order.createdAt),
    [order.paidAt, order.createdAt],
  )

  const paymentMethodLabel = useMemo(() => {
    if (!order.paymentMethod) return 'เงินสด / โอนเงิน'
    return (
      (PAYMENT_METHOD_TH as Record<string, string>)[order.paymentMethod] ||
      order.paymentMethod
    )
  }, [order.paymentMethod])

  const pointsDiscount = Number(order.pointsDiscount || 0)
  const couponDiscount = Number(order.coupon?.discountAmount || 0)
  const shippingFee = Number(order.shippingFee || 0)

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
                สำนักงานใหญ่ (Head Office)
              </p>
              {store.address && (
                <p className="max-w-md text-neutral-600 print:text-neutral-800">
                  {store.address}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 pt-1 text-neutral-700 print:text-neutral-900">
                <span>
                  เลขประจำตัวผู้เสียภาษีอากร:{' '}
                  <span className="font-semibold text-neutral-950">
                    {store.taxId
                      ? formatPromptPay(store.taxId)
                      : '0-0000-00000-00-0'}
                  </span>
                </span>
                {store.phone && <span>โทรศัพท์: {store.phone}</span>}
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right print:text-right">
            <h2 className="text-xl font-bold tracking-tight text-neutral-950">
              ใบกำกับภาษี / ใบเสร็จรับเงิน
            </h2>
            <p className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
              Tax Invoice / Receipt
            </p>
            <div className="mt-3 space-y-1">
              <p>
                <span className="text-neutral-500">เลขที่เอกสาร: </span>
                <span className="font-semibold text-neutral-950">
                  TAX-{order.orderNumber}
                </span>
              </p>
              <p>
                <span className="text-neutral-500">เลขอ้างอิงคำสั่งซื้อ: </span>
                <span className="font-medium text-neutral-900">
                  #{order.orderNumber}
                </span>
              </p>
              <p>
                <span className="text-neutral-500">วันที่ออกเอกสาร: </span>
                <span className="text-neutral-900">{documentDate}</span>
              </p>
            </div>
          </div>
        </header>
        <section className="mt-5 grid grid-cols-1 gap-4 border border-neutral-300 p-4 sm:grid-cols-2 print:grid-cols-2">
          <div className="space-y-1">
            <span className="text-neutral-500">
              ชื่อผู้ซื้อ / ผู้รับบริการ:
            </span>
            <p className="pt-0.5 font-semibold text-neutral-950">
              {customerName}
            </p>
            <span className="inline-block pt-1 text-neutral-500">
              ที่อยู่จดทะเบียนภาษี:
            </span>
            <p className="leading-relaxed text-neutral-700 print:text-neutral-900">
              {customerAddress}
            </p>
          </div>
          <div className="space-y-1 border-t border-neutral-200 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 print:border-t-0 print:border-l print:pt-0 print:pl-4">
            <p>
              <span className="text-neutral-500">
                เลขประจำตัวผู้เสียภาษีอากร:{' '}
              </span>
              <span className="font-semibold text-neutral-950">
                {customerTaxId !== '-' ? formatPromptPay(customerTaxId) : '-'}
              </span>
            </p>
            <p>
              <span className="text-neutral-500">สาขา: </span>
              <span className="font-medium text-neutral-900">
                {customerBranch}
              </span>
            </p>
            <p>
              <span className="text-neutral-500">ช่องทางการชำระเงิน: </span>
              <span className="text-neutral-900">{paymentMethodLabel}</span>
            </p>
          </div>
        </section>
        <section className="mt-5 overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-neutral-400 bg-neutral-100 font-semibold text-neutral-800 print:bg-neutral-50">
                <th className="w-12 px-2 py-2.5 text-center">ลำดับ</th>
                <th className="px-3 py-2.5">รายการ</th>
                <th className="w-20 px-3 py-2.5 text-center">จำนวน</th>
                <th className="w-32 px-3 py-2.5 text-right">ราคาต่อหน่วย</th>
                <th className="w-36 px-3 py-2.5 text-right">จำนวนเงิน</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {order.items.map((item, index) => {
                const itemTotal = Number(item.price) * item.quantity
                return (
                  <tr key={item.id} className="align-top">
                    <td className="px-2 py-2.5 text-center text-neutral-500">
                      {index + 1}
                    </td>
                    <td className="max-w-72 min-w-72 px-3 py-2.5 wrap-break-word whitespace-pre-line">
                      <p className="font-medium text-neutral-950">
                        {item.title}
                      </p>
                      {item.variantTitle && (
                        <p className="text-[11px] text-neutral-500">
                          ตัวเลือก: {item.variantTitle}
                        </p>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-center font-medium text-neutral-950">
                      {item.quantity}
                    </td>
                    <td className="max-w-32 min-w-32 px-3 py-2.5 text-right wrap-break-word whitespace-pre-line text-neutral-900">
                      {formatCurrency(Number(item.price))}
                    </td>
                    <td className="px-3 py-2.5 text-right font-semibold text-neutral-950">
                      {formatCurrency(itemTotal)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
        <section className="mt-4 break-inside-avoid border-t border-neutral-300 pt-4">
          <div className="flex flex-col justify-between gap-6 sm:flex-row print:flex-row">
            <div className="flex flex-1 flex-col justify-between space-y-3">
              <div className="border border-neutral-300 bg-neutral-50 p-3 print:bg-transparent">
                <span className="font-semibold text-neutral-600">
                  จำนวนเงินรวมทั้งสิ้น (ตัวอักษร):
                </span>
                <p className="mt-0.5 font-medium text-neutral-950">
                  {thaiBahtText(totalAmount)}
                </p>
              </div>
              <p className="text-[11px] text-neutral-500 print:text-neutral-700">
                * ราคาสินค้ารวมภาษีมูลค่าเพิ่มเรียบร้อยแล้ว (VAT Included)
              </p>
            </div>
            <div className="w-full space-y-2 sm:w-80 print:w-80">
              <div className="flex justify-between text-neutral-600 print:text-neutral-800">
                <span>มูลค่าสินค้ารวม:</span>
                <span className="font-medium text-neutral-900">
                  {formatCurrency(itemsSubtotal)}
                </span>
              </div>
              {pointsDiscount > 0 && (
                <div className="flex justify-between text-neutral-800">
                  <span>หัก ส่วนลดแต้มสะสม:</span>
                  <span>-{formatCurrency(pointsDiscount)}</span>
                </div>
              )}
              {order.coupon && couponDiscount > 0 && (
                <div className="flex justify-between text-neutral-800">
                  <span>หัก ส่วนลดคูปอง ({order.coupon.code}):</span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              {shippingFee > 0 && (
                <div className="flex justify-between text-neutral-600 print:text-neutral-800">
                  <span>ค่าบริการจัดส่ง:</span>
                  <span>{formatCurrency(shippingFee)}</span>
                </div>
              )}
              <div className="space-y-1 border-t border-neutral-300 pt-2">
                <div className="flex justify-between text-neutral-700 print:text-neutral-900">
                  <span>มูลค่าสินค้าก่อนภาษีมูลค่าเพิ่ม:</span>
                  <span>{formatCurrency(totalBeforeVat)}</span>
                </div>
                <div className="flex justify-between text-neutral-700 print:text-neutral-900">
                  <span>ภาษีมูลค่าเพิ่ม ({vatRate}%):</span>
                  <span>{formatCurrency(vatAmount)}</span>
                </div>
              </div>

              <div className="flex justify-between border-t-2 border-neutral-900 pt-2 text-sm font-bold text-neutral-950">
                <span>ยอดรวมสุทธิทั้งสิ้น:</span>
                <span className="text-base font-bold">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
      <footer className="mt-14 break-inside-avoid pt-4">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-12 print:grid-cols-2 print:gap-12">
          <div className="flex flex-col items-center">
            <div className="h-16 w-48 border-b border-neutral-400" />
            <p className="mt-2 font-medium text-neutral-900">
              ผู้รับเอกสาร / ผู้ซื้อ (Customer)
            </p>
            <p className="text-[11px] text-neutral-500">
              วันที่: _____/_____/_________
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-16 w-48 border-b border-neutral-400" />
            <p className="mt-2 font-medium text-neutral-900">
              ผู้มีอำนาจลงนาม / ในนามผู้ขาย (Authorized)
            </p>
            <p className="text-[11px] text-neutral-500">
              วันที่: _____/_____/_________
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-[11px] text-neutral-500">
          เอกสารนี้ออกโดยระบบอัตโนมัติ (ต้นฉบับ)
        </p>
      </footer>
    </div>
  )
}
