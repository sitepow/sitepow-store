'use client'

import { useState } from 'react'

import { useUpdateOrderStatus } from '@/actions/hooks/order'
import { GetOrdersItem } from '@/actions/order'
import { ORDER_STATUS_TH, PAYMENT_METHOD_TH } from '@/constants/translate'
import { OrderStatus } from '@/generated/prisma/enums'
import { formatDateTime } from '@/utils/date'
import { formatPromptPay } from '@/utils/slip'
import { IconEye } from '@tabler/icons-react'
import { User2 } from 'lucide-react'

import {
  OrderAddressCard,
  OrderItemsSummary,
  OrderPackageSizeCard,
  OrderPaymentInfoCard,
  OrderTaxInvoiceCard,
  OrderTrackingCard,
  ShippingAddressSnapshot,
} from '@/components/order'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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

  const handleStatusChange = (v: string) => {
    const newStatus = v as OrderStatus
    setSelectedStatus(newStatus)

    if (newStatus !== OrderStatus.SHIPPED || order.trackingNumber) {
      updateStatusMutation.mutate({ id: order.id, status: newStatus })
    }
  }

  const handleSaveTrackingAndStatus = () => {
    updateStatusMutation.mutate({
      id: order.id,
      status: selectedStatus,
      trackingNumber,
    })
  }

  const shippingAddr =
    (order.shippingAddrSnapshot as ShippingAddressSnapshot | null) || null

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <IconEye size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>คำสั่งซื้อ #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            วันที่สั่งซื้อ: {formatDateTime(order.createdAt)}
            {order.employee && ` | จัดการโดย: ${order.employee.name}`}
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
          <div className="bg-muted/20 space-y-2 rounded-lg border p-3">
            <div className="flex items-center">
              <Avatar className="size-9 border">
                {order.customer?.avatar && (
                  <AvatarImage src={order.customer.avatar} />
                )}
                <AvatarFallback>
                  <User2 size={16} />
                </AvatarFallback>
              </Avatar>
              <div className="ml-3 max-w-72 space-y-0.5">
                <p className="text-sm leading-none font-medium">
                  {/* {order.customer?.name || 'คุณลูกค้า'} */}
                </p>
                <p className="text-muted-foreground text-xs">
                  อีเมล: {order.customer?.email ?? '-'}
                  <br />
                  เบอร์โทรศัพท์:{' '}
                  {order.customer?.phone &&
                    formatPromptPay(order.customer.phone)}
                </p>
              </div>
            </div>
          </div>
          <OrderAddressCard address={shippingAddr} />
          <OrderTaxInvoiceCard
            isRequested={order.isTaxInvoiceRequested}
            taxName={order.taxName}
            taxId={order.taxId}
            taxBranchCode={order.taxBranchCode}
            taxAddress={order.taxAddress}
          />
          <OrderItemsSummary order={order} />
          <OrderPackageSizeCard
            totalWeight={order.totalWeight}
            width={order.width}
            height={order.height}
            length={order.length}
          />
          <div className="space-y-2">
            <div className="text-sm font-semibold">สถานะและข้อมูลการจัดส่ง</div>
            <div className="mb-3 flex flex-wrap gap-2">
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
              {order.paidAt && (
                <Badge variant="secondary">
                  ชำระเงินเมื่อ: {formatDateTime(order.paidAt)}
                </Badge>
              )}
            </div>
            <OrderPaymentInfoCard
              bankAccount={order.bankAccount}
              paymentProof={order.paymentProof}
            />
            <OrderTrackingCard
              status={order.status}
              trackingNumber={order.trackingNumber}
            />
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
