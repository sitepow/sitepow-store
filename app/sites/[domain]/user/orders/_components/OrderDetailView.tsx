import { GetStorefrontOrderItemSerialized } from '@/actions/storefront/order'
import { ORDER_STATUS_TH, PAYMENT_METHOD_TH } from '@/constants/translate'
import { OrderStatus } from '@/generated/prisma/enums'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatDateTime } from '@/utils/date'
import { calculateOrderSummary } from '@/utils/order'
import { formatCurrency } from '@/utils/pricing'
import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconTicket,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface OrderDetailViewProps {
  order: GetStorefrontOrderItemSerialized
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const { copied, copy } = useCopyToClipboard()
  const summary = calculateOrderSummary(order)

  return (
    <>
      <DialogHeader>
        <DialogTitle>คำสั่งซื้อ #{order.orderNumber}</DialogTitle>
        <DialogDescription>
          ร้านค้า: {order.store.name} | วันที่สั่งซื้อ:{' '}
          {formatDateTime(order.createdAt)}
        </DialogDescription>
      </DialogHeader>
      <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1">
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
                <span>
                  {formatCurrency(Number(item.price) * item.quantity)}
                </span>
              </div>
              {item.branch?.name && (
                <span className="text-muted-foreground text-xs">
                  จัดส่งจากสาขา {item.branch.name}
                </span>
              )}
            </div>
          ))}
          <div className="mt-3 space-y-1.5 border-t pt-3 text-sm">
            <div className="text-muted-foreground flex justify-between">
              <span>รวมราคาสินค้า</span>
              <span>{formatCurrency(summary?.itemsSubtotal)}</span>
            </div>
            {summary?.shippingFee > 0 && (
              <div className="text-muted-foreground flex justify-between">
                <span>
                  ค่าจัดส่ง{' '}
                  {order.shippingMethod ? `(${order.shippingMethod})` : ''}
                </span>
                <span>{formatCurrency(summary?.shippingFee)}</span>
              </div>
            )}
            {order.coupon && (
              <div className="flex items-center justify-between text-emerald-600">
                <span className="flex items-center gap-1">
                  <IconTicket size={14} /> ส่วนลดคูปอง ({order.coupon.code})
                </span>
                <span>
                  -
                  {formatCurrency(
                    summary?.itemsSubtotal +
                      summary?.shippingFee -
                      Number(order.totalAmount),
                  )}
                </span>
              </div>
            )}
            {summary?.pointsDiscount > 0 && (
              <div className="flex justify-between text-emerald-600">
                <span>ส่วนลดจากแต้มสะสม ({order.usedPoints} แต้ม)</span>
                <span>-{formatCurrency(summary?.pointsDiscount)}</span>
              </div>
            )}
            {summary?.codFee > 0 && (
              <div className="text-muted-foreground flex justify-between">
                <span>ค่าธรรมเนียมเก็บเงินปลายทาง (COD)</span>
                <span>{formatCurrency(summary?.codFee)}</span>
              </div>
            )}
            <div className="text-foreground flex justify-between border-t pt-2 text-base font-bold">
              <span>ยอดชำระทั้งสิ้น</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">สถานะและข้อมูลการจัดส่ง</div>
          <div className="mb-5 flex flex-wrap gap-2">
            <Badge
              variant={
                (
                  [OrderStatus.PAID, OrderStatus.SHIPPED] as OrderStatus[]
                ).includes(order.status)
                  ? 'default'
                  : 'outline'
              }
            >
              ออเดอร์: {ORDER_STATUS_TH[order.status]}
            </Badge>
            {order.paymentMethod && (
              <Badge variant="outline">
                รูปแบบชำระเงิน: {PAYMENT_METHOD_TH[order.paymentMethod]}
              </Badge>
            )}
          </div>
          {order.trackingNumber ? (
            <div className="from-primary/10 via-primary/2 to-background border-primary/25 flex items-center justify-between rounded-lg border bg-linear-to-br p-3">
              <div>
                <div className="text-muted-foreground mb-1 text-xs">
                  เลขพัสดุ (Tracking Number)
                </div>
                <div className="font-bold">{order.trackingNumber}</div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(order.trackingNumber!)}
              >
                {copied ? (
                  <>
                    <IconCheck size={16} className="mr-1" /> คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <IconCopy size={16} className="mr-1" /> คัดลอก
                  </>
                )}
              </Button>
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-4 text-sm">
              <IconAlertCircle className="shrink-0" />
              {order.status === OrderStatus.PENDING
                ? 'ระบบกำลังเตรียมการจัดส่ง เมื่อร้านค้ากรอกเลขพัสดุแล้วจะแสดงผลที่นี่'
                : 'ร้านค้ากำลังดำเนินการจัดเตรียมสินค้า เมื่อสินค้าจัดส่งสำเร็จแล้ว ระบบจะจัดส่งเลขติดตามพัสดุ (Tracking Number) ไปยังอีเมลของคุณ และจะแสดงสถานะอัปเดตในระบบสำหรับออเดอร์นี้ทันที'}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
