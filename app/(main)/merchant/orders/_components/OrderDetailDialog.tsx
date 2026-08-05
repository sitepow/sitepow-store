'use client'

import { useState } from 'react'

import { useUpdateOrderStatus } from '@/actions/hooks/order'
import { GetOrdersItem } from '@/actions/order'
import { ORDER_STATUS_TH } from '@/constants/translate'
import { OrderStatus } from '@/generated/prisma/enums'
import { formatFullAddress } from '@/utils/address'
import { formatDateTime } from '@/utils/date'
import { formatNumber } from '@/utils/pricing'
import { formatBankAccount, formatPromptPay } from '@/utils/slip'
import {
  IconEye,
  IconMapPin,
  IconPackage,
  IconReceipt,
} from '@tabler/icons-react'

import { CustomerCard } from '@/components/CustomerCard'
import {
  OrderItemsSummary,
  OrderTrackingCard,
  ShippingAddressSnapshot,
} from '@/components/order'
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
          <CustomerCard
            title="ข้อมูลการชำระเงิน"
            content={
              <>
                เลขที่บัญชี:{' '}
                {formatBankAccount(order.bankAccount?.accountNumber)} <br />
                โอนเข้าบัญชี: {order.bankAccount?.bankName} <br />
                ชื่อบัญชีธนาคาร: {order.bankAccount?.accountName}
              </>
            }
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
        <div className="space-y-2">
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
          <CustomerCard
            title={`${order.customer?.firstName} ${order.customer?.lastName}`}
            content={
              <>
                รหัสลูกค้า: {order.customer?.id} <br />
                อีเมล: {order.customer?.email} <br />
                เบอร์โทรศัพท์: {formatPromptPay(order.customer?.phone)} <br />
              </>
            }
          />
          <CustomerCard
            icon={<IconMapPin />}
            title="ที่อยู่จัดส่ง"
            content={
              <>
                ชื่อผู้รับสินค้า:{' '}
                {shippingAddr?.receiverName || shippingAddr?.name} <br />
                เบอร์โทรศัพท์:{' '}
                {shippingAddr?.phone && formatPromptPay(shippingAddr.phone)}
                <br />
                ที่อยู่รับสินค้า: {formatFullAddress(shippingAddr)}
              </>
            }
          />
          <CustomerCard
            icon={<IconPackage />}
            title="ขนาดและน้ำหนักพัสดุ"
            content={
              <>
                น้ำหนัก: {formatNumber(60)} กก. <br />
                ขนาด (กxยxส): {formatNumber(0)}x {formatNumber(0)} x{' '}
                {formatNumber(0)} ซม.
              </>
            }
          />
          <CustomerCard
            icon={<IconReceipt />}
            title="ข้อมูลใบกำกับภาษี"
            content={
              <>
                ชื่อ/บริษัท: ไซต์พาว โซลูชั่น จำกัด
                <br />
                เลขภาษี: {formatPromptPay('1348500011161')}
                <br />
                สาขา: สำนักงานใหญ่
                <br />
                ที่อยู่: <br />
              </>
            }
          />
          <OrderItemsSummary order={order} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
