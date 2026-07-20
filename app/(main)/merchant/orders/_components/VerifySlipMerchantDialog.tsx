'use client'

import { useState } from 'react'

import Image from 'next/image'

import { formatCurrency } from '@/utils/pricing'
import { IconCheck, IconReceipt, IconX } from '@tabler/icons-react'

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

interface VerifySlipMerchantDialogProps {
  order: {
    id: string
    orderNumber: string
    slipUrl?: string | null
    totalAmount: number
  }
}

export function VerifySlipMerchantDialog({
  order,
}: VerifySlipMerchantDialogProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <IconReceipt size={16} className="mr-2" /> ตรวจสอบสลิป
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>ตรวจสอบสลิปการชำระเงิน #{order.orderNumber}</DialogTitle>
          <DialogDescription>
            ยอดที่ต้องชำระ: {formatCurrency(order.totalAmount)}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center py-4">
          {order.slipUrl ? (
            <div className="bg-muted/20 relative h-96 w-full rounded-md border">
              <Image
                src={order.slipUrl}
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
        <DialogFooter className="flex justify-between sm:justify-between">
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setIsOpen(false)
              }}
            >
              <IconX /> ปฏิเสธสลิป
            </Button>
            <Button
              type="button"
              onClick={() => {
                setIsOpen(false)
              }}
              variant="success"
              disabled={!order.slipUrl}
            >
              <IconCheck /> สลิปถูกต้อง
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
