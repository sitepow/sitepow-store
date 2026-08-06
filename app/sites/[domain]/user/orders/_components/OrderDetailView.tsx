'use client'

import { useState } from 'react'

import { ShippingAddressSnapshot } from '@/actions/order'
import { GetStorefrontOrderItemSerialized } from '@/actions/storefront/order'
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
} from '@tabler/icons-react'

import { CustomerCard } from '@/components/CustomerCard'
import { OrderItemsSummary } from '@/components/order/ItemsSummary'
import { OrderStatusBadges } from '@/components/order/StatusBadges'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

interface OrderDetailViewProps {
  order: GetStorefrontOrderItemSerialized
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const { copied, copy } = useCopyToClipboard()
  const [open, setOpen] = useState(false)

  const shippingAddr =
    (order.shippingAddrSnapshot as ShippingAddressSnapshot | null) || null

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
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>คำสั่งซื้อ #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            ร้านค้า: {order.store.name} | วันที่สั่งซื้อ:{' '}
            {formatDateTime(order.createdAt)}
          </DialogDescription>
          <OrderStatusBadges
            status={order.status}
            paymentMethod={order.paymentMethod}
            isTaxInvoiceRequested={order.isTaxInvoiceRequested}
            paidAt={order.paidAt}
          />
        </DialogHeader>
        {order.trackingNumber ? (
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
        ) : (
          <CustomerCard
            icon={<IconCubeSend />}
            title="สถานะการจัดส่ง"
            content={
              order.status === OrderStatus.PENDING
                ? 'ระบบกำลังเตรียมการจัดส่ง เมื่อร้านค้ากรอกเลขพัสดุแล้วจะแสดงผลที่นี่'
                : 'ร้านค้ากำลังดำเนินการจัดเตรียมสินค้า เมื่อสินค้าจัดส่งสำเร็จแล้ว ระบบจะจัดส่งเลขติดตามพัสดุ (Tracking Number) ไปยังอีเมลของคุณ'
            }
          />
        )}
        <OrderItemsSummary order={order} />
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
