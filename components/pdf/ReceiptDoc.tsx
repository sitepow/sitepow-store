'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'

import { PAYMENT_METHOD_TH } from '@/constants/translate'
import { thaiBahtText } from '@/utils/baht-text'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'

import { OrderDocComponentProps } from './types'
import { getCustomerInfoFromOrder, getStoreInfoFromOrder } from './utils'

export function ReceiptDoc({ order }: OrderDocComponentProps) {
  const t = useTranslations('merchant.pdf')
  const store = getStoreInfoFromOrder(order)
  const customer = getCustomerInfoFromOrder(order)

  const itemsSubtotal = useMemo(
    () =>
      order.items.reduce(
        (sum, item) => sum + Number(item.price) * item.quantity,
        0,
      ),
    [order.items],
  )

  const isPaid = order.status === 'PAID' || order.status === 'SHIPPED'

  const receiptDate = useMemo(
    () => formatDateTime(order.paidAt || order.createdAt),
    [order.paidAt, order.createdAt],
  )

  const paymentMethodLabel = useMemo(() => {
    if (!order.paymentMethod) return t('common.unspecified')
    return (
      (t.has(`paymentMethods.${order.paymentMethod}`)
        ? t(`paymentMethods.${order.paymentMethod}` as any)
        : (PAYMENT_METHOD_TH as Record<string, string>)[order.paymentMethod]) ||
      order.paymentMethod
    )
  }, [order.paymentMethod, t])

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
                {store.name || t('common.onlineStore')}
              </h1>
              {store.address && (
                <p className="max-w-md text-neutral-600 print:text-neutral-800">
                  {store.address}
                </p>
              )}
              <div className="flex flex-wrap gap-x-4 pt-1 text-neutral-600 print:text-neutral-800">
                {store.phone && (
                  <span>{t('common.phone', { phone: store.phone })}</span>
                )}
                {store.email && (
                  <span>{t('common.email', { email: store.email })}</span>
                )}
                {store.taxId && (
                  <span>{t('common.taxId', { taxId: store.taxId })}</span>
                )}
              </div>
            </div>
          </div>
          <div className="text-left sm:text-right print:text-right">
            <h2 className="text-xl font-bold tracking-tight text-neutral-950">
              {t('documentTitles.receipt')}
            </h2>
            <p className="text-[11px] font-semibold tracking-widest text-neutral-500 uppercase">
              {t('documentTitles.receiptSub')}
            </p>
            <div className="mt-3 space-y-1">
              <p>
                <span className="text-neutral-500">
                  {t('common.receiptNumber')}
                </span>
                <span className="font-semibold text-neutral-950">
                  REC-{order.orderNumber}
                </span>
              </p>
              <p>
                <span className="text-neutral-500">{t('common.orderRef')}</span>
                <span className="font-medium text-neutral-900">
                  #{order.orderNumber}
                </span>
              </p>
              <p>
                <span className="text-neutral-500">
                  {t('common.dateLabel')}
                </span>
                <span className="text-neutral-900">{receiptDate}</span>
              </p>
            </div>
          </div>
        </header>
        <section className="mt-5 grid grid-cols-1 gap-4 border border-neutral-300 p-4 sm:grid-cols-2 print:grid-cols-2">
          <div className="space-y-1">
            <h3 className="font-semibold text-neutral-900">
              {t('common.customerTitle')}
            </h3>
            <p className="pt-0.5 font-semibold text-neutral-950">
              {customer.name || t('common.generalCustomer')}
            </p>
            {customer.phone && customer.phone !== '-' && (
              <p className="text-neutral-700">
                {t('common.phone', { phone: customer.phone })}
              </p>
            )}
            {customer.email && customer.email !== '-' && (
              <p className="text-neutral-700">
                {t('common.email', { email: customer.email })}
              </p>
            )}
            {customer.fullAddress && customer.fullAddress !== '-' && (
              <p className="pt-0.5 leading-relaxed text-neutral-700 print:text-neutral-900">
                {t('common.address', { address: customer.fullAddress })}
              </p>
            )}
          </div>
          <div className="space-y-1 border-t border-neutral-200 pt-3 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-4 print:border-t-0 print:border-l print:pt-0 print:pl-4">
            <h3 className="font-semibold text-neutral-900">
              {t('common.paymentDetails')}
            </h3>
            <p className="pt-0.5">
              <span className="text-neutral-500">
                {t('common.paymentChannel')}
              </span>
              <span className="font-medium text-neutral-950">
                {paymentMethodLabel}
              </span>
            </p>
            {order.paidAt && (
              <p>
                <span className="text-neutral-500">{t('common.paidAt')}</span>
                <span className="text-neutral-900">
                  {formatDateTime(order.paidAt)}
                </span>
              </p>
            )}
            {order.transactionId && (
              <p>
                <span className="text-neutral-500">
                  {t('common.transactionId')}
                </span>
                <span className="text-neutral-900">{order.transactionId}</span>
              </p>
            )}
          </div>
        </section>
        <section className="mt-5 overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-y border-neutral-400 bg-neutral-100 font-semibold text-neutral-800 print:bg-neutral-50">
                <th className="w-12 px-2 py-2.5 text-center">
                  {t('table.index')}
                </th>
                <th className="px-3 py-2.5">{t('table.item')}</th>
                <th className="w-20 px-3 py-2.5 text-center">
                  {t('table.quantity')}
                </th>
                <th className="w-32 px-3 py-2.5 text-right">
                  {t('table.unitPrice')}
                </th>
                <th className="w-36 px-3 py-2.5 text-right">
                  {t('table.amount')}
                </th>
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
                    <td className="max-w-52 min-w-52 px-3 py-2.5 wrap-break-word whitespace-pre-line">
                      <p className="font-medium text-neutral-950">
                        {item.title}
                      </p>
                      {item.variantTitle && (
                        <p className="text-[11px] text-neutral-500">
                          {t('table.variantPrefix', {
                            variant: item.variantTitle,
                          })}
                        </p>
                      )}
                      {item.customerNote && (
                        <p className="text-[11px] text-neutral-600 print:text-neutral-800">
                          {t('table.notePrefix', {
                            note: item.customerNote,
                          })}
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
            <div className="flex flex-1 flex-col justify-between space-y-4">
              <div className="border border-neutral-300 bg-neutral-50 p-3 print:bg-transparent">
                <span className="font-semibold text-neutral-600">
                  {t('summary.textAmount')}
                </span>
                <p className="mt-0.5 font-medium text-neutral-950">
                  {thaiBahtText(order.totalAmount)}
                </p>
              </div>

              {isPaid && (
                <div className="inline-block w-fit border-2 border-neutral-900 px-4 py-1.5 text-center tracking-wider text-neutral-900 uppercase">
                  <span className="text-xs font-bold">
                    {t('summary.paidSuccess')}
                  </span>
                </div>
              )}
            </div>
            <div className="w-full space-y-2 sm:w-72 print:w-72">
              <div className="flex justify-between text-neutral-600 print:text-neutral-800">
                <span>{t('summary.subtotal')}</span>
                <span className="font-medium text-neutral-900">
                  {formatCurrency(itemsSubtotal)}
                </span>
              </div>

              {pointsDiscount > 0 && (
                <div className="flex justify-between text-neutral-700">
                  <span>{t('summary.pointsDiscount')}</span>
                  <span>-{formatCurrency(pointsDiscount)}</span>
                </div>
              )}
              {order.coupon && couponDiscount > 0 && (
                <div className="flex justify-between text-neutral-700">
                  <span>
                    {t('summary.couponDiscount', {
                      code: order.coupon.code,
                    })}
                  </span>
                  <span>-{formatCurrency(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600 print:text-neutral-800">
                <span>{t('summary.shippingFee')}</span>
                <span className="text-neutral-900">
                  {shippingFee > 0 ? formatCurrency(shippingFee) : '0.00'}
                </span>
              </div>
              <div className="flex justify-between border-t-2 border-neutral-900 pt-2 text-sm font-bold text-neutral-950">
                <span>{t('summary.netTotal')}</span>
                <span className="text-base font-bold">
                  {formatCurrency(Number(order.totalAmount))}
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
              {t('signatures.cashier')}
            </p>
            <p className="text-[11px] text-neutral-500">
              {t('common.datePlaceholder')}
            </p>
          </div>
          <div className="flex flex-col items-center">
            <div className="h-16 w-48 border-b border-neutral-400" />
            <p className="mt-2 font-medium text-neutral-900">
              {t('signatures.authorized')}
            </p>
            <p className="text-[11px] text-neutral-500">
              {t('common.datePlaceholder')}
            </p>
          </div>
        </div>
        <p className="mt-8 text-center text-[11px] text-neutral-500">
          {t('common.autoGeneratedNotice')}
        </p>
      </footer>
    </div>
  )
}
