'use client'

import { IconCopy } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { type BuyerOrder } from '../page'

interface OrderDetailViewProps {
  order: BuyerOrder
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const handleCopyTracking = () => {
    if (order.trackingNo) {
      navigator.clipboard.writeText(order.trackingNo)
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>รายละเอียดคำสั่งซื้อ {order.id}</DialogTitle>
        <DialogDescription>
          ซื้อจาก: {order.storeName} | {order.createdAt}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2 rounded-lg border p-4">
          <div className="text-sm font-semibold">รายการสินค้า</div>
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span>
                {item.name} <span>x{item.qty}</span>
              </span>
              <span>฿{(item.price * item.qty).toLocaleString()}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-2 font-bold">
            <span>ยอดชำระทั้งสิ้น</span>
            <span>฿{order.totalAmount.toLocaleString()}</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-semibold">ข้อมูลการจัดส่ง</div>
          {order.trackingNo ? (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <div className="text-muted-foreground text-xs">
                  เลขพัสดุ (Tracking Number)
                </div>
                <div className="font-mono font-bold">{order.trackingNo}</div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyTracking}>
                <IconCopy size={16} /> คัดลอก
              </Button>
            </div>
          ) : (
            <div className="text-muted-foreground rounded-lg border border-dashed p-4 text-sm">
              {order.status === 'PENDING_VERIFY'
                ? 'ระบบกำลังตรวจสอบการชำระเงินของคุณ เมื่อผ่านแล้วจะเริ่มทำการแพ็คสินค้าทันที'
                : 'ร้านค้ากำลังจัดเตรียมสินค้าเพื่อนำส่งไปรษณีย์'}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
