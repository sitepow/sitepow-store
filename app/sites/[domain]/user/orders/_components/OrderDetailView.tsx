'use client'

import { GetStorefrontOrderItemSerialized } from '@/actions/storefront/order'
import { ORDER_STATUS_TH } from '@/constants/translate'
import { OrderStatus } from '@/generated/prisma/enums'
import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import { IconAlertCircle, IconCopy } from '@tabler/icons-react'

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
  const handleCopyTracking = () => {
    if (order.trackingNumber) {
      navigator.clipboard.writeText(order.trackingNumber)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>คำสั่งซื้อ #{order.orderNumber}</DialogTitle>
        <DialogDescription>
          ร้านค้า: {order.store.name} | วันที่สั่งซื้อ:{' '}
          {formatDateTime(order.createdAt)}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4">
        <div className="space-y-2 rounded-lg border p-4">
          <div className="text-sm font-semibold">รายการสินค้า</div>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                {item.title} {item.variantTitle && `(${item.variantTitle})`} x
                {item.quantity}
              </span>
              <span>{formatCurrency(Number(item.price) * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>ยอดชำระทั้งสิ้น</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-semibold">สถานะและข้อมูลการจัดส่ง</div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="outline">{ORDER_STATUS_TH[order.status]}</Badge>
          </div>

          {order.trackingNumber ? (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-muted-foreground text-xs">
                  เลขพัสดุ (Tracking Number)
                </div>
                <div className="font-bold">{order.trackingNumber}</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyTracking}>
                <IconCopy size={16} className="mr-1" /> คัดลอก
              </Button>
            </div>
          ) : (
            <div className="text-muted-foreground flex flex-wrap items-center gap-2 rounded-lg border border-dashed p-4 text-sm">
              <IconAlertCircle className="shrink-0" />
              {order.status === OrderStatus.PENDING
                ? 'ระบบกำลังเตรียมการจัดส่ง เมื่อร้านค้ากรอกเลขพัสดุแล้วจะแสดงผลที่นี่'
                : 'ร้านค้ากำลังดำเนินการจัดเตรียมสินค้า'}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
