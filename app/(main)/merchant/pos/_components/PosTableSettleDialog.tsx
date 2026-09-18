'use client'

import { useState } from 'react'

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
import { PaymentMethod } from '@/generated/prisma/enums'
import { RestaurantTableItem } from '@/types/restaurant'
import {
  IconCheck,
  IconCreditCard,
  IconQrcode,
  IconReceipt,
} from '@tabler/icons-react'

interface PosTableSettleDialogProps {
  table: RestaurantTableItem | null
  open: boolean
  onClose: () => void
  isPending: boolean
  onConfirmSettle: (
    paymentMethod: PaymentMethod,
    receivedAmount?: number,
  ) => void
}

export function PosTableSettleDialog({
  table,
  open,
  onClose,
  isPending,
  onConfirmSettle,
}: PosTableSettleDialogProps) {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    PaymentMethod.CASH_ON_DELIVERY,
  )
  const [receivedAmount, setReceivedAmount] = useState<string>('')

  if (!table) return null

  const sessionOrders = table.sessions?.[0]?.orders ?? []
  const tableBillTotal = sessionOrders.reduce(
    (sum: number, o) => sum + Number(o.totalAmount),
    0,
  )

  const numReceived = Number(receivedAmount || 0)
  const changeAmount = Math.max(0, numReceived - tableBillTotal)

  const handleSubmit = () => {
    onConfirmSettle(
      paymentMethod,
      receivedAmount ? Number(receivedAmount) : undefined,
    )
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <IconReceipt className="size-5" />
            ชำระเงินโต๊ะ {table.tableNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="bg-primary/10 rounded-2xl p-4 text-center">
            <span className="text-muted-foreground text-xs font-semibold">
              ยอดที่ต้องชำระ
            </span>
            <p className="text-primary mt-0.5 text-3xl font-black">
              ฿{tableBillTotal.toLocaleString()}
            </p>
          </div>

          <div className="space-y-1.5">
            <Label>ช่องทางการชำระเงิน</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  setPaymentMethod(PaymentMethod.CASH_ON_DELIVERY)
                }
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold ${
                  paymentMethod === PaymentMethod.CASH_ON_DELIVERY
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <IconReceipt className="size-5" />
                เงินสด (Cash)
              </button>
              <button
                type="button"
                onClick={() =>
                  setPaymentMethod(PaymentMethod.MANUAL_QR_PROMPTPAY)
                }
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold ${
                  paymentMethod === PaymentMethod.MANUAL_QR_PROMPTPAY
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <IconQrcode className="size-5" />
                สแกน PromptPay
              </button>
              <button
                type="button"
                onClick={() =>
                  setPaymentMethod(PaymentMethod.STRIPE_CREDIT_CARD)
                }
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-2.5 text-xs font-bold ${
                  paymentMethod === PaymentMethod.STRIPE_CREDIT_CARD
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground'
                }`}
              >
                <IconCreditCard className="size-5" />
                บัตรเครดิต
              </button>
            </div>
          </div>

          {paymentMethod === PaymentMethod.CASH_ON_DELIVERY && (
            <div className="bg-muted/40 space-y-3 rounded-xl border p-3">
              <div className="space-y-1">
                <Label htmlFor="received" className="text-xs">
                  จำนวนเงินที่รับมา
                </Label>
                <Input
                  id="received"
                  type="number"
                  placeholder={`เช่น ${tableBillTotal}`}
                  value={receivedAmount}
                  onChange={(e) => setReceivedAmount(e.target.value)}
                  className="h-10 text-base font-bold"
                />
              </div>

              {numReceived > 0 && (
                <div className="flex items-center justify-between pt-1 text-sm font-bold">
                  <span>เงินทอน:</span>
                  <span
                    className={`text-lg font-black ${
                      numReceived >= tableBillTotal
                        ? 'text-emerald-600'
                        : 'text-red-500'
                    }`}
                  >
                    {numReceived >= tableBillTotal
                      ? `฿${changeAmount.toLocaleString()}`
                      : 'ยอดเงินไม่พอ'}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose}>
            ยกเลิก
          </Button>
          <Button
            className="gap-1.5 bg-emerald-600 font-bold text-white hover:bg-emerald-700"
            onClick={handleSubmit}
            disabled={
              isPending ||
              (paymentMethod === PaymentMethod.CASH_ON_DELIVERY &&
                numReceived > 0 &&
                numReceived < tableBillTotal)
            }
          >
            <IconCheck className="size-4" />
            {isPending ? 'กำลังบันทึก...' : 'ยืนยันรับชำระ & ปิดโต๊ะ'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
