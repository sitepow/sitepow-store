'use client'

import { useState } from 'react'

import { useUpdateOrderStatus } from '@/actions/hooks/order'
import { GetOrdersItem, ShippingAddressSnapshot } from '@/actions/order'
import { ORDER_STATUS_TH } from '@/constants/translate'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatFullAddress } from '@/utils/address'
import { formatDateTime } from '@/utils/date'
import { formatNumber } from '@/utils/pricing'
import { formatBankAccount, formatPromptPay } from '@/utils/slip'
import {
  IconCheck,
  IconCopy,
  IconCreditCardPay,
  IconCubeSend,
  IconEye,
  IconMapPin,
  IconPackage,
  IconReceipt,
  IconUser,
} from '@tabler/icons-react'

import { CustomerCard } from '@/components/CustomerCard'
import { OrderItemsSummary } from '@/components/order/ItemsSummary'
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

interface OrderDetailViewProps {
  order: GetOrdersItem
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const { copied, copy } = useCopyToClipboard()
  const [open, setOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState(
    order.trackingNumber || '',
  )
  const [isEnteringTracking, setIsEnteringTracking] = useState(false)

  const updateStatusMutation = useUpdateOrderStatus()

  const handleUpdateStatus = (status: OrderStatus, tracking?: string) => {
    updateStatusMutation.mutate(
      { id: order.id, status, trackingNumber: tracking },
      {
        onSuccess: () => setIsEnteringTracking(false),
      },
    )
  }

  const handleStatusSelect = (value: string) => {
    const nextStatus = value as OrderStatus

    if (nextStatus === OrderStatus.SHIPPED && !order.trackingNumber) {
      setIsEnteringTracking(true)
      return
    }

    setIsEnteringTracking(false)
    handleUpdateStatus(nextStatus)
  }

  const handleSaveTracking = () => {
    handleUpdateStatus(OrderStatus.SHIPPED, trackingNumber)
  }

  const shippingAddr =
    (order.shippingAddrSnapshot as ShippingAddressSnapshot | null) || null

  const isCancelled = order.status === OrderStatus.CANCELLED
  const isPending = updateStatusMutation.isPending

  const isDirectPayment =
    order.paymentMethod === PaymentMethod.BANK_TRANSFER ||
    order.paymentMethod === PaymentMethod.MANUAL_QR_PROMPTPAY

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <IconEye size={16} />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] gap-2.5 overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>คำสั่งซื้อ #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            วันที่สั่งซื้อ: {formatDateTime(order.createdAt)}
          </DialogDescription>
          <OrderStatusBadges
            status={order.status}
            paymentMethod={order.paymentMethod}
            isTaxInvoiceRequested={order.isTaxInvoiceRequested}
            paidAt={order.paidAt}
          />
        </DialogHeader>
        <div className="flex flex-wrap items-center justify-between gap-3 border-y py-3">
          <span className="text-sm font-medium">อัปเดตสถานะออเดอร์</span>
          <Select
            value={order.status}
            disabled={isCancelled || isPending}
            onValueChange={handleStatusSelect}
          >
            <SelectTrigger className="w-44">
              {isPending ? <Spinner /> : <SelectValue />}
            </SelectTrigger>
            <SelectContent>
              {Object.values(OrderStatus).map((status) => (
                <SelectItem key={status} value={status}>
                  {ORDER_STATUS_TH[status]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {isEnteringTracking && (
          <OrderTrackingForm
            trackingNumber={trackingNumber}
            isPending={isPending}
            onTrackingNumberChange={setTrackingNumber}
            onSubmit={handleSaveTracking}
          />
        )}
        {order.trackingNumber && (
          <CustomerCard
            icon={<IconCubeSend />}
            title="เลขพัสดุ (Tracking Number)"
            content={
              <>
                เลขติดตามขนส่ง: {order.trackingNumber} <br />
                วิธีการจัดส่ง: {order.shippingMethod || '-'}
              </>
            }
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(order.trackingNumber || '')}
              >
                {copied ? (
                  <>
                    <IconCheck size={16} /> คัดลอกแล้ว
                  </>
                ) : (
                  <>
                    <IconCopy size={16} /> คัดลอก
                  </>
                )}
              </Button>
            }
          />
        )}
        <OrderItemsSummary order={order} />
        <CustomerCard
          icon={<IconUser />}
          title="ข้อมูลลูกค้า"
          content={
            <>
              ชื่อลูกค้า: {order.customer?.firstName} {order.customer?.lastName}{' '}
              <br />
              อีเมล: {order.customer?.email || '-'} <br />
              เบอร์โทรศัพท์:{' '}
              {order.customer?.phone
                ? formatPromptPay(order.customer.phone)
                : '-'}
            </>
          }
        />
        <CustomerCard
          icon={<IconMapPin />}
          title="ที่อยู่จัดส่ง"
          content={
            <>
              ชื่อผู้รับ:{' '}
              {shippingAddr?.receiverName || shippingAddr?.name || '-'} <br />
              เบอร์โทรศัพท์:{' '}
              {shippingAddr?.phone ? formatPromptPay(shippingAddr.phone) : '-'}
              <br />
              ที่อยู่: {formatFullAddress(shippingAddr) || '-'}
            </>
          }
        />
        {isDirectPayment && (
          <CustomerCard
            icon={<IconCreditCardPay />}
            title="ข้อมูลการชำระเงิน"
            content={
              <>
                ธนาคาร: {order.bankAccount?.bankName || '-'} <br />
                เลขที่บัญชี:{' '}
                {order.bankAccount?.accountNumber
                  ? formatBankAccount(order.bankAccount.accountNumber)
                  : '-'}{' '}
                <br />
                ชื่อบัญชี: {order.bankAccount?.accountName || '-'}
              </>
            }
          />
        )}
        <CustomerCard
          icon={<IconPackage />}
          title="ขนาดและน้ำหนักพัสดุ"
          content={
            <>
              น้ำหนัก: {formatNumber(order.totalWeight || 0)} กก. <br />
              ขนาด (กxยxส): {formatNumber(order.width || 0)} x{' '}
              {formatNumber(order.length || 0)} x{' '}
              {formatNumber(order.height || 0)} ซม.
            </>
          }
        />
        {order.isTaxInvoiceRequested && (
          <CustomerCard
            icon={<IconReceipt />}
            title="ข้อมูลใบกำกับภาษี"
            content={
              <>
                ชื่อ/บริษัท: {order.taxName || '-'}
                <br />
                เลขประจำตัวผู้เสียภาษี:{' '}
                {order.taxId ? formatPromptPay(order.taxId) : '-'}
                <br />
                สาขา: {order.taxBranchCode || 'สำนักงานใหญ่'}
                <br />
                ที่อยู่จดทะเบียน: {order.taxAddress || '-'}
              </>
            }
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
