'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useRouter } from 'next/navigation'

import { useCreatePOSOrder } from '@/actions/hooks/pos/order'
import { PaymentMethod } from '@/generated/prisma/enums'
import { CartItem } from '@/types/sites/cart'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { IconCash, IconQrcode } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
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

interface PosCheckoutModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cart: CartItem[]
  storeId: string
  branchId: string
  totalAmount: number
  discountAmount: number
  onSuccess: () => void
}

export function PosCheckoutModal({
  open,
  onOpenChange,
  cart,
  storeId,
  branchId,
  totalAmount,
  discountAmount,
  onSuccess,
}: PosCheckoutModalProps) {
  const router = useRouter()
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH_ON_DELIVERY,
  )
  const [receivedAmount, setReceivedAmount] = useState<string>('')

  const { mutate: createOrder, isPending } = useCreatePOSOrder()

  const received = Number(receivedAmount)
  const changeAmount = received - totalAmount
  const isCash = paymentMethod === PaymentMethod.CASH_ON_DELIVERY
  const isValidCash = isCash ? received >= totalAmount : true

  const handleQuickAmount = (amount: number) => {
    setReceivedAmount(amount.toString())
  }

  const handleCheckout = () => {
    if (isCash && !isValidCash) {
      toast.error('จำนวนเงินรับมาไม่เพียงพอ')
      return
    }

    createOrder(
      {
        storeId,
        branchId,
        paymentMethod: isCash
          ? PaymentMethod.CASH_ON_DELIVERY
          : PaymentMethod.MANUAL_QR_PROMPTPAY,
        receivedAmount: isCash ? received : undefined,
        changeAmount: isCash ? Math.max(0, changeAmount) : undefined,
        discountAmount,
        items: cart.map((item) => ({
          productId: item.productId,
          variantId: item.variant.id,
          title: item.productTitle,
          variantTitle: item.variant.title,
          quantity: item.quantity,
          price: item.unitPrice,
          productType: item.productType,
        })),
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            onSuccess()
            onOpenChange(false)
            setReceivedAmount('')
            router.push('/merchant/orders')
          }
        },
      },
    )
  }

  const quickAmounts = [100, 500, 1000]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="p-0">
        <div className="bg-primary/10 bo rder-b p-5 text-center">
          <p className="text-muted-foreground text-xs font-semibold">
            ยอดรวมที่ต้องชำระ
          </p>
          <div className="text-primary mt-1 text-4xl font-extrabold tracking-tight">
            {formatCurrency(totalAmount)}
          </div>
        </div>
        <div className="space-y-5 px-5">
          <DialogHeader className="p-0 text-left">
            <DialogTitle className="text-base font-semibold">
              เลือกช่องทางการชำระเงิน
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY)}
              className={cn(
                'hover:bg-muted/50 relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 p-4 transition-all',
                isCash
                  ? 'border-primary bg-primary/5 text-primary font-semibold shadow-sm'
                  : 'border-border text-muted-foreground',
              )}
            >
              <IconCash className="size-7" />
              <span className="text-sm">เงินสด (Cash)</span>
              {isCash && (
                <Badge className="bg-primary absolute top-2 right-2 size-2 rounded-full p-0" />
              )}
            </button>
            <button
              type="button"
              onClick={() =>
                setPaymentMethod(PaymentMethod.MANUAL_QR_PROMPTPAY)
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
              {!isCash && (
                <Badge className="bg-primary absolute top-2 right-2 size-2 rounded-full p-0" />
              )}
            </button>
          </div>
          {isCash && (
            <div className="bg-muted/30 border-border/80 space-y-4 rounded-xl border p-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold">
                    จำนวนเงินที่รับมา
                  </Label>
                  {received > 0 && (
                    <button
                      type="button"
                      onClick={() => setReceivedAmount('')}
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
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
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
                {quickAmounts.map((amt) => (
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
                  receivedAmount && !isValidCash
                    ? 'bg-destructive/10 text-destructive'
                    : 'bg-background border',
                )}
              >
                <span className="text-sm font-medium">
                  {receivedAmount && !isValidCash ? 'เงินยังขาดอีก' : 'เงินทอน'}
                </span>
                <span
                  className={cn(
                    'text-xl font-extrabold',
                    receivedAmount && !isValidCash
                      ? 'text-destructive'
                      : 'text-primary',
                  )}
                >
                  {receivedAmount
                    ? formatCurrency(Math.abs(changeAmount))
                    : '-'}
                </span>
              </div>
            </div>
          )}
        </div>
        <DialogFooter className="bg-muted/20 gap-2 border-t p-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="w-full sm:w-auto"
          >
            ยกเลิก
          </Button>
          <Button
            type="button"
            size="lg"
            onClick={handleCheckout}
            disabled={isPending || (isCash && !isValidCash)}
            className="w-full min-w-40 font-bold sm:w-auto"
          >
            {isPending ? 'กำลังบันทึก...' : 'ยืนยันการชำระเงิน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
