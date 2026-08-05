'use client'

import { GetStorefrontOrderItemSerialized } from '@/actions/storefront/order'
import { OrderStatus } from '@/generated/prisma/enums'
import { formatDateTime } from '@/utils/date'

import {
  OrderAddressCard,
  OrderItemsSummary,
  OrderPackageSizeCard,
  OrderPaymentInfoCard,
  OrderTaxInvoiceCard,
  OrderTrackingCard,
  ShippingAddressSnapshot,
} from '@/components/order'
import { OrderStatusBadges } from '@/components/order/StatusBadges'
import {
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface OrderDetailViewProps {
  order: GetStorefrontOrderItemSerialized
}

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const shippingAddr =
    (order.shippingAddrSnapshot as ShippingAddressSnapshot | null) || null

  return (
    <>
      <DialogHeader>
        <DialogTitle>คำสั่งซื้อ #{order.orderNumber}</DialogTitle>
        <DialogDescription>
          ร้านค้า: {order.store.name} | วันที่สั่งซื้อ:{' '}
          {formatDateTime(order.createdAt)}
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
        <OrderTrackingCard
          status={order.status}
          trackingNumber={order.trackingNumber}
          emptyMessage={
            order.status === OrderStatus.PENDING
              ? 'ระบบกำลังเตรียมการจัดส่ง เมื่อร้านค้ากรอกเลขพัสดุแล้วจะแสดงผลที่นี่'
              : 'ร้านค้ากำลังดำเนินการจัดเตรียมสินค้า เมื่อสินค้าจัดส่งสำเร็จแล้ว ระบบจะจัดส่งเลขติดตามพัสดุ (Tracking Number) ไปยังอีเมลของคุณ และจะแสดงสถานะอัปเดตในระบบสำหรับออเดอร์นี้ทันที'
          }
        />
      </div>
      <div className="max-h-[85vh] space-y-5 overflow-y-auto sm:max-w-lg">
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
    </>
  )
}
