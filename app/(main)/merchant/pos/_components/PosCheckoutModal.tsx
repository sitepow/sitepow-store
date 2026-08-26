'use client'

import { useFormContext } from 'react-hook-form'
import toast from 'react-hot-toast'

import Link from 'next/link'

import { usePaymentSetting } from '@/actions/hooks/payment'
import { useCreatePOSOrder } from '@/actions/hooks/pos/order'
import { useCartStore } from '@/app/sites/[domain]/cart/store'
import { QUICK_AMOUNTS } from '@/constants/credit'
import { OrderStatus, PaymentMethod } from '@/generated/prisma/enums'
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
  onSuccess: () => void
}

export function PosCheckoutModal({
  open,
  onOpenChange,
  totalAmount,
  earnedPoints,
  onSuccess,
}: PosCheckoutModalProps) {
  const clearCart = useCartStore((state) => state.clearCart)
  const { watch, setValue, handleSubmit, reset } =
    useFormContext<POSCheckoutInput>()

  const storeId = watch('storeId')

  const { data: paymentSetting } = usePaymentSetting(storeId)

  const isStripeAvailable =
    !!paymentSetting?.isStripeEnabled && !!paymentSetting?.stripeSecretKey

  const { mutate: createOrder, isPending } = useCreatePOSOrder()
  const cartItems = useCartStore((state) => state.items)

  const paymentMethod = watch('paymentMethod')
  const receivedAmount = watch('receivedAmount') || 0

  const isCash =
    !isStripeAvailable || paymentMethod === PaymentMethod.CASH_ON_DELIVERY
  const changeAmount = receivedAmount - totalAmount
  const isValidCash = isCash ? receivedAmount >= totalAmount : true

  const handleQuickAmount = (amount: number) => {
    setValue('receivedAmount', amount)
  }

  const handlePaymentMethodSelect = (method: PaymentMethod) => {
    if (method !== PaymentMethod.CASH_ON_DELIVERY && !isStripeAvailable) {
      toast.error('กรุณาตั้งค่า Stripe ก่อนเปิดรับชำระด้วย PromptPay')
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
    if (isCash && !isValidCash) {
      toast.error('จำนวนเงินรับมาไม่เพียงพอ')
      return
    }

    createOrder(
      {
        storeId: data.storeId,
        branchId: data.branchId,
        customerId: data.customerId,
        usedPoints:
          data.usedPoints && data.usedPoints > 0 ? data.usedPoints : undefined,
        earnedPoints: earnedPoints,
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
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            clearCart()
            reset()
            onSuccess()
            onOpenChange(false)
          }
        },
      },
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="overflow-hidden p-0">
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
            <div className="grid gap-3 sm:grid-cols-2">
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
              {isStripeAvailable ? (
                <button
                  type="button"
                  onClick={() =>
                    handlePaymentMethodSelect(PaymentMethod.STRIPE_QR_PROMPTPAY)
                  }
                  className={cn(
                    'hover:bg-muted/50 relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
                    !isCash
                      ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                      : 'border-border text-muted-foreground',
                  )}
                >
                  <IconQrcode className="size-7" />
                  <span className="text-sm">พร้อมเพย์ / QR</span>
                </button>
              ) : (
                <div className="border-border text-muted-foreground bg-muted/20 relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed p-3 text-center">
                  <IconQrcode className="text-muted-foreground/60 size-6" />
                  <span className="text-xs font-medium">
                    พร้อมเพย์ (ยังไม่พร้อมใช้)
                  </span>
                  <Link
                    href="http://lvh.me:3000/merchant/settings?tab=settings-payment"
                    target="_blank"
                    className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline"
                  >
                    ตั้งค่าระบบชำระเงิน
                    <IconExternalLink className="size-3" />
                  </Link>
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
              disabled={isPending || (isCash && !isValidCash)}
              className="w-full min-w-40 font-bold sm:w-auto"
            >
              {isPending ? 'กำลังบันทึก...' : 'ยืนยันการชำระเงิน'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
