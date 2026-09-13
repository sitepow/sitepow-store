'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'

import { GetOrdersItem } from '@/actions/order'
import { GetStorefrontOrderItemSerialized } from '@/actions/storefront/order'
import { SummaryRow } from '@/app/sites/[domain]/_components/cart/_components/SummaryRow'
import { calculateOrderSummary } from '@/utils/order'
import { formatCurrency, formatNumber } from '@/utils/pricing'

import { HighlightText } from '../HighlightText'
import { ProductImage } from '../ProductImage'

export interface OrderItemsSummaryProps {
  order: GetOrdersItem | GetStorefrontOrderItemSerialized
}

export function OrderItemsSummary({ order }: OrderItemsSummaryProps) {
  const t = useTranslations('common.order')

  const tr = (key: string, values?: any, fallback?: string) => {
    try {
      if (t.has(key as any)) {
        return t(key as any, values)
      }
    } catch {}
    return fallback ?? key
  }

  const {
    rawSubtotal,
    productDiscount,
    shippingFee,
    pointsDiscount,
    codFee,
    couponDiscount,
  } = useMemo(() => {
    const summaryResult = calculateOrderSummary(order)
    const itemsList = order.items ?? []

    let rawSubtotal = 0
    let productDiscount = 0

    for (const item of itemsList) {
      const unitPrice = Number(item.price ?? 0)
      const originalPrice = item.originalPrice
        ? Number(item.originalPrice)
        : unitPrice
      const qty = item.quantity ?? 1

      rawSubtotal += originalPrice * qty
      if (originalPrice > unitPrice) {
        productDiscount += (originalPrice - unitPrice) * qty
      }
    }

    const sellingSubtotal = rawSubtotal - productDiscount
    const shippingFee = summaryResult?.shippingFee ?? 0
    const pointsDiscount = summaryResult?.pointsDiscount ?? 0
    const codFee = summaryResult?.codFee ?? 0
    const totalAmount = Number(order.totalAmount ?? 0)

    const calculatedCouponDiscount =
      sellingSubtotal + shippingFee + codFee - pointsDiscount - totalAmount

    return {
      rawSubtotal,
      productDiscount,
      shippingFee,
      pointsDiscount,
      codFee,
      couponDiscount: Math.max(0, calculatedCouponDiscount),
    }
  }, [order])

  const {
    items = [],
    shippingMethod,
    coupon,
    usedPoints = 0,
    earnedPoints = 0,
    totalAmount,
  } = order

  const currency = (order as any)?.customerCurrency || 'THB'

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="text-sm font-semibold">
        {tr('items', undefined, 'รายการสินค้า')}
      </div>

      {items.map((item, idx) => {
        const itemKey = item.id || `${item.title}-${item.variantTitle}-${idx}`
        const unitPrice = Number(item.price)
        const originalUnitPrice = item.originalPrice
          ? Number(item.originalPrice)
          : unitPrice
        const totalPrice = unitPrice * item.quantity
        const totalOriginalPrice = originalUnitPrice * item.quantity

        const hasDiscount = originalUnitPrice > unitPrice

        const itemAny = item as any
        const imageUrl =
          itemAny.image ||
          itemAny.variant?.image ||
          itemAny.product?.images?.find((img: any) => img.isPrimary)?.url ||
          itemAny.product?.images?.[0]?.url ||
          null

        return (
          <div
            key={itemKey}
            className="flex items-start gap-3 border-b pb-2 text-sm last:border-b-0 last:pb-0"
          >
            <ProductImage src={imageUrl} alt={item.title} />
            <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex min-w-0 flex-1 flex-col gap-0.5 break-all">
                <span className="text-foreground leading-snug font-medium break-all">
                  {item.title}{' '}
                  {item.variantTitle && (
                    <span className="text-muted-foreground inline-block font-normal break-all">
                      ({item.variantTitle})
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground text-xs">
                  {tr(
                    'itemQuantityDetail',
                    {
                      quantity: item.quantity,
                      price: hasDiscount
                        ? formatNumber(unitPrice)
                        : formatNumber(originalUnitPrice),
                    },
                    `จำนวน: ${item.quantity} ชิ้น x ชิ้นละ ${
                      hasDiscount
                        ? formatNumber(unitPrice)
                        : formatNumber(originalUnitPrice)
                    } บาท`,
                  )}
                </span>
                {item.customerNote && (
                  <span className="text-primary mt-0.5 text-xs wrap-break-word italic">
                    {tr(
                      'notePrefix',
                      { note: item.customerNote },
                      `โน้ต: ${item.customerNote}`,
                    )}
                  </span>
                )}
                {item.branch?.name && (
                  <span className="text-primary mt-0.5 text-xs">
                    {tr(
                      'shippedFromBranch',
                      { branch: item.branch.name },
                      `จัดส่งจากสาขา ${item.branch.name}`,
                    )}
                  </span>
                )}
                <div className="flex shrink-0 flex-col items-start whitespace-nowrap">
                  {hasDiscount && (
                    <span className="text-muted-foreground text-xs line-through">
                      {formatCurrency(totalOriginalPrice, currency)}
                    </span>
                  )}
                  <span className="text-primary font-semibold">
                    {formatCurrency(totalPrice, currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })}
      <div className="mt-3 space-y-1.5 border-t pt-3">
        <SummaryRow
          label={tr('subtotal', undefined, 'รวมราคาสินค้า')}
          value={formatCurrency(rawSubtotal, currency)}
        />
        {productDiscount > 0 && (
          <SummaryRow
            label={tr('productDiscount', undefined, 'ส่วนลดสินค้า')}
            value={formatCurrency(productDiscount, currency)}
            isDiscount
          />
        )}
        {!!shippingFee && (
          <SummaryRow
            label={
              shippingMethod
                ? tr(
                    'shippingFeeWithMethod',
                    { method: shippingMethod },
                    `ค่าจัดส่ง (${shippingMethod})`,
                  )
                : tr('shippingFee', undefined, 'ค่าจัดส่ง')
            }
            value={formatCurrency(shippingFee, currency)}
          />
        )}
        {!!coupon && couponDiscount > 0 && (
          <SummaryRow
            label={tr(
              'couponDiscount',
              { code: coupon.code },
              `ส่วนลดคูปอง (${coupon.code})`,
            )}
            value={formatCurrency(couponDiscount, currency)}
            isDiscount
          />
        )}
        {(usedPoints ?? 0) > 0 && (
          <SummaryRow
            label={tr(
              'pointsDiscount',
              { points: formatNumber(usedPoints ?? 0) },
              `ส่วนลดจากแต้มสะสม (${formatNumber(usedPoints ?? 0)} แต้ม)`,
            )}
            value={formatCurrency(pointsDiscount, currency)}
            isDiscount
          />
        )}
        {!!codFee && (
          <SummaryRow
            label={tr('codFee', undefined, 'ค่าธรรมเนียมเก็บเงินปลายทาง (COD)')}
            value={formatCurrency(codFee, currency)}
          />
        )}
        {(earnedPoints ?? 0) > 0 && (
          <p className="text-primary text-right text-xs font-medium">
            {tr(
              'earnPoints',
              { points: formatNumber(earnedPoints ?? 0) },
              `คุณจะได้รับ ${formatNumber(earnedPoints ?? 0)} แต้ม`,
            )}
          </p>
        )}
        <div className="text-foreground flex flex-col items-end border-t pt-2.5 text-base font-bold">
          <div className="flex w-full justify-between">
            <span>{tr('totalPayment', undefined, 'ยอดชำระทั้งสิ้น')}</span>
            <HighlightText>
              {formatCurrency(totalAmount, currency)}
            </HighlightText>
          </div>
          {(order as any)?.baseCurrency &&
            (order as any)?.customerCurrency &&
            (order as any)?.customerCurrency !== (order as any)?.baseCurrency &&
            (order as any)?.totalAmountBase !== undefined && (
              <span className="text-muted-foreground text-xs font-normal">
                (~
                {formatCurrency(
                  Number((order as any).totalAmountBase),
                  (order as any).baseCurrency,
                )}
                )
              </span>
            )}
        </div>
      </div>
    </div>
  )
}
