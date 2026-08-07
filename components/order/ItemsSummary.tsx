import { useMemo } from 'react'

import { GetOrdersItem } from '@/actions/order'
import { GetStorefrontOrderItemSerialized } from '@/actions/storefront/order'
import { EmptyImage } from '@/app/sites/[domain]/_components/EmptyImage'
import { SummaryRow } from '@/app/sites/[domain]/_components/cart/_components/SummaryRow'
import { calculateOrderSummary } from '@/utils/order'
import { formatCurrency, formatNumber } from '@/utils/pricing'

import { HighlightText } from '../HighlightText'

export interface OrderItemsSummaryProps {
  order: GetOrdersItem | GetStorefrontOrderItemSerialized
}

export function OrderItemsSummary({ order }: OrderItemsSummaryProps) {
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

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="text-sm font-semibold">รายการสินค้า</div>

      {items.map((item, idx) => {
        const itemKey = item.id || `${item.title}-${item.variantTitle}-${idx}`
        const unitPrice = Number(item.price)
        const originalUnitPrice = item.originalPrice
          ? Number(item.originalPrice)
          : unitPrice
        const totalPrice = unitPrice * item.quantity
        const totalOriginalPrice = originalUnitPrice * item.quantity

        const hasDiscount = originalUnitPrice > unitPrice

        return (
          <div
            key={itemKey}
            className="flex items-start gap-3 border-b pb-2 text-sm last:border-b-0 last:pb-0"
          >
            <EmptyImage className="size-16 shrink-0 rounded-md text-[10px]" />
            <div className="flex w-full flex-col items-start justify-between gap-2.5 sm:flex-row sm:items-center">
              <div className="flex flex-1 flex-col gap-0.5">
                <span className="text-foreground font-medium">
                  {item.title}{' '}
                  {item.variantTitle && (
                    <span className="text-muted-foreground font-normal">
                      ({item.variantTitle})
                    </span>
                  )}
                </span>
                <span className="text-muted-foreground text-xs">
                  จำนวน: {item.quantity} ชิ้น x ชิ้นละ{' '}
                  {hasDiscount
                    ? formatNumber(unitPrice)
                    : formatNumber(originalUnitPrice)}{' '}
                  บาท
                </span>
                {item.customerNote && (
                  <span className="text-primary mt-0.5 text-xs italic">
                    โน้ต: {item.customerNote}
                  </span>
                )}
                {item.branch?.name && (
                  <span className="text-primary mt-0.5 text-xs">
                    จัดส่งจากสาขา {item.branch.name}
                  </span>
                )}
              </div>
              <div className="flex flex-col items-center whitespace-nowrap">
                {hasDiscount && (
                  <span className="text-muted-foreground text-xs line-through">
                    {formatCurrency(totalOriginalPrice)}
                  </span>
                )}
                <span className="text-primary font-semibold">
                  {formatCurrency(totalPrice)}
                </span>
              </div>
            </div>
          </div>
        )
      })}
      <div className="mt-3 space-y-1.5 border-t pt-3">
        <SummaryRow label="รวมราคาสินค้า" value={formatCurrency(rawSubtotal)} />
        {productDiscount > 0 && (
          <SummaryRow
            label="ส่วนลดสินค้า"
            value={formatCurrency(productDiscount)}
            isDiscount
          />
        )}
        {!!shippingFee && (
          <SummaryRow
            label={`ค่าจัดส่ง ${shippingMethod ? `(${shippingMethod})` : ''}`}
            value={formatCurrency(shippingFee)}
          />
        )}
        {!!coupon && couponDiscount > 0 && (
          <SummaryRow
            label={`ส่วนลดคูปอง (${coupon.code})`}
            value={formatCurrency(couponDiscount)}
            isDiscount
          />
        )}
        {(usedPoints ?? 0) > 0 && (
          <SummaryRow
            label={`ส่วนลดจากแต้มสะสม (${usedPoints?.toLocaleString()} แต้ม)`}
            value={formatCurrency(pointsDiscount)}
            isDiscount
          />
        )}
        {!!codFee && (
          <SummaryRow
            label="ค่าธรรมเนียมเก็บเงินปลายทาง (COD)"
            value={formatCurrency(codFee)}
          />
        )}
        {(earnedPoints ?? 0) > 0 && (
          <SummaryRow
            label="แต้มสะสมที่จะได้รับ"
            value={
              <HighlightText>+ {formatNumber(earnedPoints ?? 0)}</HighlightText>
            }
          />
        )}
        <div className="text-foreground flex justify-between border-t pt-2.5 text-base font-bold">
          <span>ยอดชำระทั้งสิ้น</span>
          <HighlightText>{formatCurrency(totalAmount)}</HighlightText>
        </div>
      </div>
    </div>
  )
}
