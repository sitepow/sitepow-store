'use client'

import { useState } from 'react'

import { useUpdateOrderStatus } from '@/actions/hooks/order'
import { GetOrdersItem } from '@/actions/order'
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
  IconEye,
  IconTicket,
} from '@tabler/icons-react'
import { User2 } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Spinner } from '@/components/ui/spinner'

interface OrderDetailDialogProps {
  order: GetOrdersItem
}

export function OrderDetailDialog({ order }: OrderDetailDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(
    order.status,
  )
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || '',
  )

  const updateStatusMutation = useUpdateOrderStatus()
  const { copied, copy } = useCopyToClipboard()

  const handleStatusChange = (v: string) => {
    const newStatus = v as OrderStatus
    setSelectedStatus(newStatus)

    if (newStatus !== OrderStatus.SHIPPED || order.trackingNumber) {
      updateStatusMutation.mutate({
        id: order.id,
        status: newStatus,
      })
    }
  }

  const handleSaveTrackingAndStatus = () => {
    updateStatusMutation.mutate({
      id: order.id,
      status: selectedStatus,
      trackingNumber,
    })
  }

  const summary = calculateOrderSummary(order)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <IconEye size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>คำสั่งซื้อ #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            วันที่สั่งซื้อ: {formatDateTime(order.createdAt)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-y py-3">
            <span className="text-sm font-medium">อัปเดตสถานะออเดอร์</span>
            <Select
              value={selectedStatus}
              disabled={
                order.status === OrderStatus.CANCELLED ||
                updateStatusMutation.isPending
              }
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-44">
                {updateStatusMutation.isPending ? <Spinner /> : <SelectValue />}
              </SelectTrigger>
              <SelectContent>
                {Object.values(OrderStatus).map((s) => (
                  <SelectItem key={s} value={s}>
                    {ORDER_STATUS_TH[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="bg-muted/20 space-y-1 rounded-lg border p-3">
            <div className="flex items-center">
              <Avatar className="size-8 border">
                <AvatarFallback>
                  <User2 size={16} />
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 max-w-72 space-y-0.5">
                <p className="text-sm leading-none font-medium">
                  {summary?.customerName || 'คุณลูกค้า'}
                </p>
                <p className="text-muted-foreground text-xs">
                  {order.customer?.email ?? '-'}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="text-sm font-semibold">รายการสินค้า</div>
            {order.items.map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col gap-0.5 border-b pb-2 text-sm last:border-b-0 last:pb-0"
              >
                <div className="flex justify-between">
                  <span>
                    {item.title} {item.variantTitle && `(${item.variantTitle})`}{' '}
                    x{item.quantity}
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
              {order.coupon && summary?.couponDiscount > 0 && (
                <div className="flex items-center justify-between text-emerald-600">
                  <span className="flex items-center gap-1">
                    <IconTicket size={14} /> ส่วนลดคูปอง ({order.coupon.code})
                  </span>
                  <span>-{formatCurrency(summary?.couponDiscount)}</span>
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
                  : 'ยังไม่ได้ระบุเลขติดตามพัสดุในระบบ'}
              </div>
            )}
          </div>
          {selectedStatus === OrderStatus.SHIPPED && !order.trackingNumber && (
            <div className="space-y-3 rounded-lg border p-4">
              <div className="space-y-1">
                <Label className="text-sm font-medium">
                  กรุณากรอกเลขพัสดุสำหรับการจัดส่ง
                </Label>
                <p className="text-muted-foreground text-xs">
                  จำเป็นต้องระบุเลข Tracking Number
                  ก่อนเปลี่ยนสถานะเป็นกำลังจัดส่ง
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="ระบุเลข Tracking Number เช่น TH123456789..."
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                />
                <Button
                  onClick={handleSaveTrackingAndStatus}
                  disabled={
                    updateStatusMutation.isPending || !trackingNumber.trim()
                  }
                  className="shrink-0"
                >
                  {updateStatusMutation.isPending ? <Spinner /> : 'บันทึก'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
