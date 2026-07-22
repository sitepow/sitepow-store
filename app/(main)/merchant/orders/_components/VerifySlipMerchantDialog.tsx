'use client'

import { useState } from 'react'

import Image from 'next/image'

import { useApproveSlipManual } from '@/actions/hooks/verify-slip'
import { SlipVerificationAction } from '@/types/slip'
import { formatCurrency } from '@/utils/pricing'
import { formatBankAccount } from '@/utils/slip'
import { IconCheck, IconDownload, IconX } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Spinner } from '@/components/ui/spinner'

interface VerifySlipMerchantDialogProps {
  order: {
    id: string
    orderNumber: string
    paymentProof?: string | null
    totalAmount: number
    bankAccount?: {
      bankName: string
      accountNumber: string
      accountName: string
    } | null
  }
}

export function VerifySlipMerchantDialog({
  order,
}: VerifySlipMerchantDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { mutate: handleVerifySlip, isPending } = useApproveSlipManual()

  const onAction = (action: SlipVerificationAction) => {
    handleVerifySlip(
      { orderId: order.id, action },
      {
        onSuccess: (res) => {
          if (res.success) {
            setIsOpen(false)
          }
        },
      },
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <IconDownload size={16} /> ตรวจสอบสลิป
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ตรวจสอบสลิปการชำระเงิน #{order.orderNumber}</DialogTitle>
          <DialogDescription className="space-y-1">
            <span className="text-foreground block font-medium">
              ยอดที่ต้องชำระ:{' '}
              <span className="text-primary">
                {formatCurrency(order.totalAmount)}
              </span>
            </span>
            {order.bankAccount && (
              <span className="text-foreground block font-medium">
                ธนาคารที่ลูกค้าเลือกโอน: {order.bankAccount.bankName} (เลขบัญชี:{' '}
                {formatBankAccount(order.bankAccount.accountNumber)}) ชื่อบัญชี:{' '}
                {order.bankAccount.accountName}
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          {order.paymentProof ? (
            <div className="border-primary relative h-96 w-full border border-dashed">
              <Image
                src={order.paymentProof}
                alt={`Slip for order ${order.orderNumber}`}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <ActionRequiredAlert
              description="ยังไม่มีการแนบสลิปสำหรับออเดอร์นี้"
              title="แจ้งเตือน"
            />
          )}
        </div>
        <DialogFooter className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onAction(SlipVerificationAction.REJECT)}
          >
            {isPending ? <Spinner /> : <IconX />} ปฏิเสธสลิป
          </Button>
          <Button
            type="button"
            onClick={() => onAction(SlipVerificationAction.APPROVE)}
          >
            {isPending ? <Spinner /> : <IconCheck />} สลิปถูกต้อง
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
