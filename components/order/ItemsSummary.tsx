import { SummaryRow } from '@/app/sites/[domain]/_components/cart/_components/SummaryRow'
import { calculateOrderSummary } from '@/utils/order'
import { formatCurrency, formatNumber } from '@/utils/pricing'

export interface OrderItemDetails {
  title: string
  variantTitle?: string | null
  quantity: number
  price: number
  customerNote?: string | null
  branch?: { name: string } | null
}

interface OrderItemsSummaryProps {
  order: {
    items: OrderItemDetails[]
    totalAmount: number
    shippingMethod?: string | null
    coupon?: { code: string } | null
    usedPoints?: number | null
    earnedPoints?: number | null
  }
}

export function OrderItemsSummary({ order }: OrderItemsSummaryProps) {
  const summary = calculateOrderSummary(order)

  const couponDiscount =
    (summary?.itemsSubtotal || 0) +
    (summary?.shippingFee || 0) -
    (summary?.pointsDiscount || 0) -
    Number(order.totalAmount || 0)

  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="text-sm font-semibold">รายการสินค้า</div>
      {order.items.map((item, idx) => (
        <div
          key={idx}
          className="flex flex-col gap-0.5 border-b pb-2 text-sm last:border-b-0 last:pb-0"
        >
          <div className="flex justify-between">
            <span>
              {item.title} {item.variantTitle && `(${item.variantTitle})`} x
              {item.quantity}
            </span>
            <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
          </div>
          {item.customerNote && (
            <span className="text-muted-foreground text-xs italic">
              โน้ต: {item.customerNote}
            </span>
          )}
          {item.branch?.name && (
            <span className="text-muted-foreground text-xs">
              จัดส่งจากสาขา {item.branch.name}
            </span>
          )}
        </div>
      ))}
      <div className="mt-3 space-y-1.5 border-t pt-3">
        <SummaryRow
          label="รวมราคาสินค้า"
          value={formatCurrency(summary?.itemsSubtotal)}
        />
        {summary?.shippingFee > 0 && (
          <SummaryRow
            label={`ค่าจัดส่ง ${
              order.shippingMethod ? `(${order.shippingMethod})` : ''
            }`}
            value={formatCurrency(summary?.shippingFee)}
          />
        )}
        {order.coupon && couponDiscount > 0 && (
          <SummaryRow
            label={`ส่วนลดคูปอง (${order.coupon.code})`}
            value={formatCurrency(couponDiscount)}
            isDiscount
          />
        )}
        {(order.usedPoints ?? 0) > 0 && (
          <SummaryRow
            label={`ส่วนลดจากแต้มสะสม (${order.usedPoints?.toLocaleString()} แต้ม)`}
            value={formatCurrency(summary?.pointsDiscount || 0)}
            isDiscount
          />
        )}
        {summary?.codFee > 0 && (
          <SummaryRow
            label="ค่าธรรมเนียมเก็บเงินปลายทาง (COD)"
            value={formatCurrency(summary?.codFee)}
          />
        )}
        {(order.earnedPoints ?? 0) > 0 && (
          <SummaryRow
            label="แต้มสะสมที่จะได้รับ"
            value={
              <span className="text-primary">
                + {formatNumber(order.earnedPoints ?? 0)} แต้ม
              </span>
            }
          />
        )}
        <div className="text-foreground flex justify-between border-t pt-2.5 text-base font-bold">
          <span>ยอดชำระทั้งสิ้น</span>
          <span className="text-primary">
            {formatCurrency(order.totalAmount)}
          </span>
        </div>
      </div>
    </div>
  )
}
