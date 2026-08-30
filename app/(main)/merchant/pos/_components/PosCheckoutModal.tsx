'use client'

import { useEffect } from 'react'
import { useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import Link from 'next/link'

import { useStoreCheckout } from '@/actions/hooks/checkout'
import { usePaymentSettingStatus } from '@/actions/hooks/payment'
import { useCreatePOSOrder } from '@/actions/hooks/pos/order'
import { useCreateResellerPOSOrder } from '@/actions/hooks/reseller'
import { useCartStore } from '@/app/sites/[domain]/cart/store'
import { QUICK_AMOUNTS } from '@/constants/credit'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
import { useSession } from '@/hooks/use-session'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { POSCheckoutInput } from '@/zod/order'
import { IconCash, IconExternalLink, IconQrcode } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { cn } from '@/lib/utils'

import { DigitalPriceDisplay } from './DigitalPriceDisplay'

interface PosCheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  totalAmount: number
  earnedPoints: number
  agreementId?: string
  onSuccess: () => void
}

export function PosCheckoutModal({
  open,
  onOpenChange,
  totalAmount,
  earnedPoints,
  agreementId,
  onSuccess,
}: PosCheckoutModalProps) {
  const clearCart = useCartStore((state) => state.clearCart)
  const cartItems = useCartStore((state) => state.items)
  const { watch, setValue, handleSubmit, reset } =
    useFormContext<POSCheckoutInput>()

  const isResellerMode = Boolean(agreementId)
  const { user } = useSession()

  const currentStoreId = watch('storeId')

  const supplierStoreId = cartItems[0]?.supplierStoreId || cartItems[0]?.storeId

  const targetCheckStoreId =
    isResellerMode && supplierStoreId ? supplierStoreId : currentStoreId

  const { data: isStripeAvailable = false } =
    usePaymentSettingStatus(targetCheckStoreId)

  const { mutate: createStandardOrder, isPending: isStandardPending } =
    useCreatePOSOrder()
  const { mutate: createResellerOrder, isPending: isResellerPending } =
    useCreateResellerPOSOrder()

  const storeCheckoutMutation = useStoreCheckout()

  const isPending =
    isStandardPending || isResellerPending || storeCheckoutMutation.isPending

  const paymentMethod = watch('paymentMethod')
  const receivedAmount = watch('receivedAmount') || 0

  useEffect(() => {
    if (open && isResellerMode) {
      setValue('paymentMethod', PaymentMethod.STRIPE_QR_PROMPTPAY)
      setValue('status', OrderStatus.PENDING)
    }
  }, [open, isResellerMode, setValue])

  const isCash =
    !isResellerMode && paymentMethod === PaymentMethod.CASH_ON_DELIVERY

  const changeAmount = receivedAmount - totalAmount
  const isValidCash = isCash ? receivedAmount >= totalAmount : true

  const isCurrentPaymentValid = isCash
    ? isValidCash
    : paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY && isStripeAvailable

  const handleQuickAmount = (amount: number) => {
    setValue('receivedAmount', amount)
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    if (isResellerMode && method === PaymentMethod.CASH_ON_DELIVERY) {
      toast.error('โหมดตัวแทนจำหน่ายต้องโอนเงินชำระตรงเข้าเจ้าของร้านเท่านั้น')
      return
    }

    if (method !== PaymentMethod.CASH_ON_DELIVERY && !isStripeAvailable) {
      toast.error(
        isResellerMode
          ? 'ร้านค้าเจ้าของสินค้านี้ยังไม่ได้เปิดใช้งาน Stripe'
          : 'กรุณาตั้งค่า Stripe ก่อนเปิดรับชำระด้วย PromptPay',
      )
      return
    }

    setValue('paymentMethod', method)
    setValue(
      'status',
      method === PaymentMethod.CASH_ON_DELIVERY
        ? OrderStatus.SHIPPED
        : OrderStatus.PENDING,
    )
  }

  const onSubmit = (data: POSCheckoutInput) => {
    if (!isCurrentPaymentValid) {
      if (
        !isStripeAvailable &&
        paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY
      ) {
        toast.error(
          isResellerMode
            ? 'ระบบชำระเงินของร้านค้าเจ้าของสินค้ายังไม่พร้อมใช้งาน'
            : 'ระบบชำระเงิน PromptPay ยังไม่พร้อมใช้งาน กรุณาตั้งค่า Stripe',
        )
        return
      }
      if (isCash && !isValidCash) {
        toast.error('จำนวนเงินรับมาไม่เพียงพอ')
        return
      }
    }

    const handleSuccess = (res: {
      success: boolean
      data?: { id: string; orderNumber: string; totalAmount: number }
    }) => {
      if (res.success && res.data) {
        const createdOrder = res.data

        if (paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY) {
          toast.loading('กำลังนำคุณไปยังหน้าชำระเงิน Stripe...')

          // ส่ง storeId ของร้านค้าที่เป็นเจ้าของสินค้าเข้า checkout mutation
          storeCheckoutMutation.mutate(
            {
              storeId: targetCheckStoreId,
              orderId: createdOrder.id,
              customerEmail: user?.email || 'guest@checkout.local',
              description: `ชำระเงินคำสั่งซื้อ #${createdOrder.orderNumber}`,
              amount: Number(createdOrder.totalAmount),
              successUrl: `${window.location.origin}/merchant/orders`,
              cancelUrl: `${window.location.origin}/merchant/orders`,
            },
            {
              onSuccess: (checkoutRes) => {
                if (checkoutRes?.url) {
                  clearCart()
                  reset()
                  onSuccess()
                  onOpenChange(false)
                  window.location.href = checkoutRes.url
                } else {
                  toast.error('ไม่สามารถสร้างลิงก์ชำระเงิน Stripe ได้')
                }
              },
              onError: (err) => {
                toast.error(
                  err instanceof Error
                    ? err.message
                    : 'เกิดข้อผิดพลาดในการเชื่อมต่อ Stripe',
                )
              },
            },
          )
        } else {
          clearCart()
          reset()
          onSuccess()
          onOpenChange(false)
          toast.success('ทำรายการสำเร็จ')
        }
      }
    }

    if (isResellerMode && agreementId) {
      const resellerPayload = {
        agreementId,
        supplierStoreId: data.storeId,
        branchId: data.branchId,
        items: cartItems.map((item) => ({
          variantId: item.variant.id,
          quantity: item.quantity,
        })),
      }

      createResellerOrder(resellerPayload, {
        onSuccess: handleSuccess,
      })
      return
    }

    const standardPayload = {
      storeId: data.storeId,
      branchId: data.branchId,
      customerId: data.customerId,
      usedPoints:
        data.usedPoints && data.usedPoints > 0 ? data.usedPoints : undefined,
      earnedPoints,
      status: isCash ? OrderStatus.SHIPPED : OrderStatus.PENDING,
      paymentMethod: isCash
        ? PaymentMethod.CASH_ON_DELIVERY
        : PaymentMethod.STRIPE_QR_PROMPTPAY,
      receivedAmount: isCash ? receivedAmount : undefined,
      changeAmount: isCash ? Math.max(0, changeAmount) : undefined,
      discountAmount: data.discountAmount,
      items: cartItems.map((item) => ({
        productId: item.productId,
        variantId: item.variant.id,
        title: item.productTitle,
        variantTitle: item.variant.title || '',
        quantity: item.quantity,
        price: item.unitPrice,
        originalPrice: item.originalPrice ?? item.unitPrice,
        image: item.image || null,
        productType: item.productType,
        branchId: item.branchId || data.branchId,
      })),
    }

    createStandardOrder(standardPayload, {
      onSuccess: handleSuccess,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="overflow-x-hidden p-0">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DigitalPriceDisplay
            value={totalAmount}
            size="lg"
            className="rounded-none border-x-0 border-t-0"
          />
          <div className="space-y-5 px-5 pt-4">
            <DialogHeader className="p-0 text-left">
              <DialogTitle className="text-base font-semibold">
                เลือกช่องทางการชำระเงิน
              </DialogTitle>
            </DialogHeader>
            <div
              className={cn(
                'grid gap-3',
                isResellerMode ? 'grid-cols-1' : 'sm:grid-cols-2',
              )}
            >
              {!isResellerMode && (
                <button
                  type="button"
                  onClick={() =>
                    handlePaymentMethodSelect(PaymentMethod.CASH_ON_DELIVERY)
                  }
                  className={cn(
                    'hover:bg-muted/50 relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
                    isCash
                      ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  <IconCash className="size-7" />
                  <span className="text-sm">เงินสด (Cash)</span>
                </button>
              )}
              {isStripeAvailable ? (
                <button
                  type="button"
                  onClick={() =>
                    handlePaymentMethodSelect(PaymentMethod.STRIPE_QR_PROMPTPAY)
                  }
                  className={cn(
                    'hover:bg-muted/50 relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
                    paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY
                      ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  <IconQrcode className="size-7" />
                  <span className="text-sm">
                    {isResellerMode
                      ? 'โอนเข้าเจ้าของร้าน (พร้อมเพย์ / QR)'
                      : 'พร้อมเพย์ / QR'}
                  </span>
                </button>
              ) : (
                <div className="border-border text-muted-foreground bg-muted/20 relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-3 text-center">
                  <IconQrcode className="text-muted-foreground/60 size-6" />
                  <span className="text-xs font-medium">
                    {isResellerMode
                      ? 'ร้านค้ายังไม่เปิดระบบชำระเงิน (ยังไม่พร้อมใช้)'
                      : 'พร้อมเพย์ (ยังไม่พร้อมใช้)'}
                  </span>
                  {!isResellerMode && (
                    <Link
                      href="http://lvh.me:3000/merchant/settings?tab=settings-payment"
                      target="_blank"
                      className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline"
                    >
                      ตั้งค่าระบบชำระเงิน
                      <IconExternalLink className="size-3" />
                    </Link>
                  )}
                </div>
              )}
            </div>
            {isCash && (
              <div className="bg-muted/30 border-border/80 space-y-4 rounded-xl border p-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-semibold">
                      จำนวนเงินที่รับมา
                    </Label>
                    {receivedAmount > 0 && (
                      <button
                        type="button"
                        onClick={() => setValue('receivedAmount', 0)}
                        className="text-muted-foreground hover:text-foreground text-xs underline"
                      >
                        ล้างจำนวนเงิน
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      type="number"
                      min={totalAmount}
                      value={receivedAmount || ''}
                      onChange={(e) =>
                        setValue('receivedAmount', Number(e.target.value))
                      }
                      autoFocus
                      placeholder="0.00"
                      className="h-12 pr-12 text-right text-xl font-bold tracking-wide"
                    />
                    <span className="text-muted-foreground absolute top-3 right-3 text-sm font-semibold">
                      บาท
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-9 font-medium"
                    onClick={() => handleQuickAmount(totalAmount)}
                  >
                    พอดี
                  </Button>
                  {QUICK_AMOUNTS.map((amt) => (
                    <Button
                      key={amt}
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-9 font-medium"
                      onClick={() => handleQuickAmount(amt)}
                    >
                      {formatNumber(amt)}
                    </Button>
                  ))}
                </div>
                <div
                  className={cn(
                    'flex items-center justify-between rounded-lg p-3.5 transition-all',
                    receivedAmount > 0 && !isValidCash
                      ? 'bg-destructive/10 text-destructive'
                      : 'bg-background border',
                  )}
                >
                  <span className="text-sm font-medium">
                    {receivedAmount > 0 && !isValidCash
                      ? 'เงินยังขาดอีก'
                      : 'เงินทอน'}
                  </span>
                  <span
                    className={cn(
                      'text-xl font-extrabold',
                      receivedAmount > 0 && !isValidCash
                        ? 'text-destructive'
                        : 'text-primary',
                    )}
                  >
                    {receivedAmount > 0
                      ? formatCurrency(Math.abs(changeAmount))
                      : '-'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="bg-muted/20 mt-5 gap-2 border-t p-4 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              className="w-full sm:w-auto"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={isPending || !isCurrentPaymentValid}
              className="w-full min-w-40 font-bold sm:w-auto"
            >
              {isPending
                ? 'กำลังเชื่อมต่อ...'
                : paymentMethod === PaymentMethod.STRIPE_QR_PROMPTPAY
                  ? 'ไปที่หน้าชำระเงิน'
                  : 'ยืนยันการชำระเงิน'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
