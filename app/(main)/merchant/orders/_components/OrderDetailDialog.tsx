/* eslint-disable @next/next/no-img-element */
'use client'

import { useState } from 'react'

import { useUpdateOrderStatus } from '@/actions/hooks/order'
import { GetOrdersItem } from '@/actions/order'
import { SummaryRow } from '@/app/sites/[domain]/_components/cart/_components/SummaryRow'
import { ORDER_STATUS_TH, PAYMENT_METHOD_TH } from '@/constants/translate'
import { OrderStatus } from '@/generated/prisma/enums'
import { useCopyToClipboard } from '@/hooks/use-copy-to-clipboard'
import { formatDateTime } from '@/utils/date'
import { calculateOrderSummary } from '@/utils/order'
import { formatCurrency } from '@/utils/pricing'
import { formatPromptPay } from '@/utils/slip'
import {
  IconAlertCircle,
  IconCheck,
  IconCoins,
  IconCopy,
  IconEye,
  IconFileText,
  IconMapPin,
  IconPackage,
  IconReceipt,
} from '@tabler/icons-react'
import { User2 } from 'lucide-react'

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

interface ShippingAddressSnapshot {
  name?: string
  receiverName?: string
  phone?: string
  addressLine?: string
  subDistrict?: string
  district?: string
  province?: string
  postalCode?: string
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

  const couponDiscount =
    (summary?.itemsSubtotal || 0) +
    (summary?.shippingFee || 0) -
    (summary?.pointsDiscount || 0) -
    Number(order.totalAmount || 0)

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
                  {summary?.customerName || 'คุณลูกค้า'}
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
          {shippingAddr && (
            <div className="space-y-1.5 rounded-lg border p-3 text-sm">
              <div className="text-muted-foreground flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase">
                <IconMapPin size={15} /> ที่อยู่จัดส่ง (Shipping Address)
              </div>
              <div className="font-medium">
                {shippingAddr.receiverName || shippingAddr.name}{' '}
                {shippingAddr.phone && `(${shippingAddr.phone})`}
              </div>
              <div className="text-muted-foreground text-xs leading-relaxed">
                {[
                  shippingAddr.addressLine,
                  shippingAddr.subDistrict,
                  shippingAddr.district,
                  shippingAddr.province,
                  shippingAddr.postalCode,
                ]
                  .filter(Boolean)
                  .join(' ')}
              </div>
            </div>
          )}
          {order.isTaxInvoiceRequested && (
            <div className="space-y-1.5 rounded-lg border border-blue-500/30 bg-blue-500/5 p-3 text-sm">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                <IconReceipt size={15} /> ข้อมูลใบกำกับภาษี (Tax Invoice)
              </div>
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>
                  <span className="text-muted-foreground">ชื่อ/บริษัท:</span>{' '}
                  <span className="font-medium">{order.taxName || '-'}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">เลขภาษี:</span>{' '}
                  <span className="font-medium">{order.taxId || '-'}</span>
                </div>
                {order.taxBranchCode && (
                  <div>
                    <span className="text-muted-foreground">สาขา:</span>{' '}
                    <span className="font-medium">{order.taxBranchCode}</span>
                  </div>
                )}
                {order.taxAddress && (
                  <div className="col-span-2">
                    <span className="text-muted-foreground">ที่อยู่:</span>{' '}
                    <span className="font-medium">{order.taxAddress}</span>
                  </div>
                )}
              </div>
            </div>
          )}
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
                {item.customerNote && (
                  <span className="text-muted-foreground text-xs italic">
                    โน้ต: {item.customerNote}
                  </span>
                )}
                {item.branch?.name && (
                  <span className="text-muted-foreground text-xs">
                    จัดส่งจากสาขา {item.branch.name}
                  </span>
                )}
              </div>
            ))}
            <div className="mt-3 space-y-1.5 border-t pt-3">
              <SummaryRow
                label="รวมราคาสินค้า"
                value={formatCurrency(summary?.itemsSubtotal)}
              />
              {summary?.shippingFee > 0 && (
                <SummaryRow
                  label={`ค่าจัดส่ง ${
                    order.shippingMethod ? `(${order.shippingMethod})` : ''
                  }`}
                  value={formatCurrency(summary?.shippingFee)}
                />
              )}
              {order.coupon && couponDiscount > 0 && (
                <SummaryRow
                  label={`ส่วนลดคูปอง (${order.coupon.code})`}
                  value={formatCurrency(couponDiscount)}
                  isDiscount
                />
              )}
              {(order.usedPoints ?? 0) > 0 && (
                <SummaryRow
                  label={`ส่วนลดจากแต้มสะสม (${order.usedPoints?.toLocaleString()} แต้ม)`}
                  value={formatCurrency(summary?.pointsDiscount || 0)}
                  isDiscount
                />
              )}
              {summary?.codFee > 0 && (
                <SummaryRow
                  label="ค่าธรรมเนียมเก็บเงินปลายทาง (COD)"
                  value={formatCurrency(summary?.codFee)}
                />
              )}
              <div className="text-foreground flex justify-between border-t pt-2.5 text-base font-bold">
                <span>ยอดชำระทั้งสิ้น</span>
                <span>{formatCurrency(order.totalAmount)}</span>
              </div>
              {(order.earnedPoints ?? 0) > 0 && (
                <div className="mt-2 flex items-center justify-between rounded-md bg-amber-500/10 p-2 text-xs text-amber-700 dark:text-amber-400">
                  <span className="flex items-center gap-1 font-medium">
                    <IconCoins size={14} /> แต้มสะสมที่จะได้รับ
                  </span>
                  <span className="font-bold">
                    +{order.earnedPoints?.toLocaleString()} แต้ม
                  </span>
                </div>
              )}
            </div>
          </div>
          {(order.totalWeight ||
            order.width ||
            order.height ||
            order.length) && (
            <div className="space-y-1.5 rounded-lg border p-3 text-xs">
              <div className="text-muted-foreground flex items-center gap-1.5 font-semibold tracking-wider uppercase">
                <IconPackage size={15} /> ขนาดและน้ำหนักพัสดุ
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {order.totalWeight && (
                  <span>น้ำหนัก: {order.totalWeight} กก.</span>
                )}
                {(order.width || order.height || order.length) && (
                  <span>
                    ขนาด (กxยxส): {order.width || 0} x {order.length || 0} x{' '}
                    {order.height || 0} ซม.
                  </span>
                )}
              </div>
            </div>
          )}
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
            {(order.bankAccount || order.paymentProof) && (
              <div className="space-y-2 rounded-lg border p-3 text-xs">
                <div className="text-muted-foreground flex items-center gap-1.5 font-semibold">
                  <IconFileText size={15} /> ข้อมูลการชำระเงิน
                </div>
                {order.bankAccount && (
                  <div>
                    โอนเข้าบัญชี: {order.bankAccount.bankName}{' '}
                    {order.bankAccount.accountNumber} (
                    {order.bankAccount.accountName})
                  </div>
                )}
                {order.paymentProof && (
                  <div className="space-y-1 pt-1">
                    <span className="text-muted-foreground">
                      หลักฐานการโอนเงิน (Slip):
                    </span>
                    <a
                      href={order.paymentProof}
                      target="_blank"
                      rel="noreferrer"
                      className="block max-w-32 overflow-hidden rounded-md border"
                    >
                      <img
                        src={order.paymentProof}
                        alt="Payment Proof"
                        className="h-auto w-full object-cover transition-transform hover:scale-105"
                      />
                    </a>
                  </div>
                )}
              </div>
            )}
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
