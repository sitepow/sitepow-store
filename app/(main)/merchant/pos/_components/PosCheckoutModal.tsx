'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useCreatePOSOrder } from '@/actions/hooks/pos/order'
import { PaymentMethod } from '@/generated/prisma/enums'
import { CartItem } from '@/types/sites/cart'
import { formatCurrency } from '@/utils/pricing'
import { IconCash, IconCheck, IconQrcode } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

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
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH_ON_DELIVERY,
  )
  const [receivedAmount, setReceivedAmount] = useState<string>('')

  const { mutate: createOrder, isPending } = useCreatePOSOrder()

  const received = Number(receivedAmount)
  const changeAmount = Math.max(0, received - totalAmount)
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
        changeAmount: isCash ? changeAmount : undefined,
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
          }
        },
      },
    )
  }

  const quickAmounts = [100, 500, 1000]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>ชำระเงิน</DialogTitle>
          <DialogDescription>
            ยอดชำระทั้งหมด{' '}
            <span className="text-primary font-bold">
              {formatCurrency(totalAmount)}
            </span>
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 py-4">
          <Button
            type="button"
            variant={isCash ? 'default' : 'outline'}
            className="flex h-20 flex-col gap-2"
            onClick={() => setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY)}
          >
            <IconCash className="size-6" />
            เงินสด
          </Button>
          <Button
            type="button"
            variant={
              paymentMethod === PaymentMethod.MANUAL_QR_PROMPTPAY
                ? 'default'
                : 'outline'
            }
            className="flex h-20 flex-col gap-2"
            onClick={() => setPaymentMethod(PaymentMethod.MANUAL_QR_PROMPTPAY)}
          >
            <IconQrcode className="size-6" />
            พร้อมเพย์ / โอนเงิน
          </Button>
        </div>
        {isCash && (
          <div className="bg-muted/50 space-y-4 rounded-lg border p-4">
            <div className="space-y-2">
              <Label>รับเงินสดมา (บาท)</Label>
              <Input
                type="number"
                min={totalAmount}
                value={receivedAmount}
                onChange={(e) => setReceivedAmount(e.target.value)}
                autoFocus
                placeholder={totalAmount.toString()}
                className="text-right text-lg font-bold"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => handleQuickAmount(totalAmount)}
              >
                พอดี
              </Button>
              {quickAmounts.map((amt) => (
                <Button
                  key={amt}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleQuickAmount(amt)}
                >
                  {amt}
                </Button>
              ))}
            </div>
            <div className="flex items-center justify-between border-t pt-2 text-lg font-bold">
              <span>เงินทอน</span>
              <span className={changeAmount > 0 ? 'text-primary' : ''}>
                {receivedAmount ? formatCurrency(changeAmount) : '-'}
              </span>
            </div>
          </div>
        )}
        <DialogFooter className="mt-4 gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            ยกเลิก
          </Button>
          <Button
            onClick={handleCheckout}
            disabled={isPending || (isCash && !isValidCash)}
            className="w-full sm:w-auto"
          >
            {isPending ? (
              'กำลังบันทึก...'
            ) : (
              <>
                <IconCheck className="mr-2 size-4" />
                ยืนยันการชำระเงิน
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
