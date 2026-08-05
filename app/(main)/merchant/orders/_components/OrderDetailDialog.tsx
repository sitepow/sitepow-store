'use client'

import { useState } from 'react'

import { useUpdateOrderStatus } from '@/actions/hooks/order'
import { GetOrdersItem } from '@/actions/order'
import { ORDER_STATUS_TH } from '@/constants/translate'
import { OrderStatus } from '@/generated/prisma/enums'
import { formatDateTime } from '@/utils/date'
import { IconEye } from '@tabler/icons-react'

import {
  OrderAddressCard,
  OrderItemsSummary,
  OrderPackageSizeCard,
  OrderPaymentInfoCard,
  OrderTaxInvoiceCard,
  OrderTrackingCard,
  ShippingAddressSnapshot,
} from '@/components/order'
import { OrderCustomerInfoCard } from '@/components/order/CustomerInfoCard'
import { OrderStatusBadges } from '@/components/order/StatusBadges'
import { OrderTrackingForm } from '@/components/order/TrackingForm'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>คำสั่งซื้อ #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            วันที่สั่งซื้อ: {formatDateTime(order.createdAt)}
            {order.employee && ` | จัดการโดย: ${order.employee.name}`}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <div className="text-sm font-semibold">สถานะและข้อมูลการจัดส่ง</div>
          <OrderStatusBadges
            status={order.status}
            paymentMethod={order.paymentMethod}
            paidAt={order.paidAt}
          />
          <OrderPaymentInfoCard
            bankAccount={order.bankAccount}
            paymentProof={order.paymentProof}
          />
          {(order.status === OrderStatus.PAID ||
            order.status === OrderStatus.SHIPPED) &&
            order.trackingNumber && (
              <OrderTrackingCard
                status={order.status}
                trackingNumber={order.trackingNumber}
              />
            )}
          {selectedStatus === OrderStatus.SHIPPED &&
            !order.trackingNumber &&
            order.trackingNumber && (
              <OrderTrackingForm
                trackingNumber={trackingNumber}
                isPending={updateStatusMutation.isPending}
                onTrackingNumberChange={setTrackingNumber}
                onSubmit={handleSaveTrackingAndStatus}
              />
            )}
        </div>
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
          <OrderCustomerInfoCard customer={order.customer} />
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
        </div>
      </DialogContent>
    </Dialog>
  )
}
