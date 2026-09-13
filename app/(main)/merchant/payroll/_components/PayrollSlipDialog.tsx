'use client'

import React, { useEffect, useState } from 'react'

import { useUpdatePayrollItemPayout } from '@/actions/hooks/payroll'
import { PayoutStatus } from '@/generated/prisma/enums'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { MonthlyPayrollItemRecord } from '@/types/payroll'
import {
  IconBuildingBank,
  IconCheck,
  IconClock,
  IconReceipt,
  IconUpload,
  IconX,
} from '@tabler/icons-react'
import Image from 'next/image'
import toast from 'react-hot-toast'

import { Badge } from '@/components/ui/badge'
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
import { Textarea } from '@/components/ui/textarea'

interface PayrollSlipDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId: string
  period: string
  item: MonthlyPayrollItemRecord | null
}

export function PayrollSlipDialog({
  open,
  onOpenChange,
  storeId,
  period,
  item,
}: PayrollSlipDialogProps) {
  const { formatCurrency } = useMerchantCurrency()
  const updateMutation = useUpdatePayrollItemPayout(storeId, period)

  const [slipImage, setSlipImage] = useState<string>('')
  const [paymentNote, setPaymentNote] = useState<string>('')
  const [paidDate, setPaidDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  )
  const [status, setStatus] = useState<PayoutStatus>(PayoutStatus.PAID)

  useEffect(() => {
    if (item) {
      setSlipImage(item.slipImage || '')
      setPaymentNote(item.paymentNote || '')
      setPaidDate(
        item.paidAt
          ? new Date(item.paidAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      )
      setStatus(item.status || PayoutStatus.PAID)
    }
  }, [item, open])

  if (!item) return null

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('ไฟล์รูปภาพต้องมีขนาดไม่เกิน 5MB')
        return
      }
      const reader = new FileReader()
      reader.onloadend = () => {
        setSlipImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSave = async (markAsPaid: boolean) => {
    try {
      const newStatus = markAsPaid ? PayoutStatus.PAID : PayoutStatus.PENDING
      const res = await updateMutation.mutateAsync({
        itemId: item.id,
        storeId,
        period,
        status: newStatus,
        slipImage: markAsPaid ? slipImage || null : null,
        paidAt: markAsPaid ? new Date(paidDate) : null,
        paymentNote: paymentNote || null,
      })

      if (res.success) {
        toast.success(
          markAsPaid
            ? `บันทึกการโอนเงินให้ ${item.employeeName} สำเร็จ`
            : `ยกเลิกสถานะโอนเงินของ ${item.employeeName} แล้ว`,
        )
        onOpenChange(false)
      } else {
        toast.error(res.message || 'ไม่สามารถบันทึกข้อมูลได้')
      }
    } catch {
      toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
  }

  const isPaid = item.status === PayoutStatus.PAID

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconReceipt className="size-5 text-primary" />
            บันทึกการโอนเงินเดือนพนักงาน
          </DialogTitle>
          <DialogDescription>
            บันทึกหลักฐานการโอน วันที่โอน และสถานะจ่ายเงินเดือน
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee & Payout Amount Box */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-foreground text-base">
                  {item.employeeName}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {item.position || 'พนักงาน'}
                  {item.department ? ` • ${item.department}` : ''}
                </p>
              </div>
              <Badge
                variant={isPaid ? 'default' : 'secondary'}
                className={
                  isPaid
                    ? 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
                    : 'bg-amber-500/10 text-amber-600 border-amber-200'
                }
              >
                {isPaid ? (
                  <span className="flex items-center gap-1">
                    <IconCheck className="size-3" /> โอนแล้ว
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <IconClock className="size-3" /> รอโอน
                  </span>
                )}
              </Badge>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-background p-3 border border-border/50">
              <span className="text-xs text-muted-foreground">ยอดเงินเดือนสุทธิ:</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(item.netSalary)}
              </span>
            </div>

            {/* Bank details */}
            <div className="text-xs space-y-1 text-muted-foreground pt-1 border-t border-border/50">
              {item.bankName && (
                <div className="flex items-center gap-1 text-foreground font-medium">
                  <IconBuildingBank className="size-3.5" />
                  {item.bankName}
                </div>
              )}
              {item.bankAccount && (
                <div>เลขบัญชี: {item.bankAccount} ({item.bankAccountName || item.employeeName})</div>
              )}
              {item.promptPay && (
                <div>พร้อมเพย์: {item.promptPay}</div>
              )}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs">วันที่โอนเงิน</Label>
              <Input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">สลิปหลักฐานการโอนเงิน</Label>
              {slipImage ? (
                <div className="mt-2 space-y-2">
                  <div className="relative h-48 w-full overflow-hidden rounded-lg border bg-muted">
                    <Image
                      src={slipImage}
                      alt="สลิปโอนเงิน"
                      fill
                      className="object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute right-2 top-2 size-7 rounded-full shadow-md"
                      onClick={() => setSlipImage('')}
                    >
                      <IconX className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="mt-1 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border/80 bg-muted/10 p-5 text-center hover:bg-muted/30 transition-colors">
                  <IconUpload className="size-7 text-muted-foreground" />
                  <span className="mt-2 text-xs font-medium text-foreground">
                    คลิกเพื่ออัปโหลดรูปภาพสลิป
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    PNG, JPG ไม่เกิน 5MB
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </label>
              )}
            </div>

            <div>
              <Label className="text-xs">บันทึกการโอน / หมายเหตุ</Label>
              <Textarea
                rows={2}
                placeholder="เช่น โอนผ่าน KBANK เวลา 14:30 น."
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0 mt-2">
          {isPaid && (
            <Button
              type="button"
              variant="outline"
              className="text-rose-500 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              disabled={updateMutation.isPending}
              onClick={() => handleSave(false)}
            >
              ยกเลิกสถานะโอน
            </Button>
          )}
          <Button
            type="button"
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
            disabled={updateMutation.isPending}
            onClick={() => handleSave(true)}
          >
            <IconCheck className="size-4 mr-1" />
            {updateMutation.isPending ? 'กำลังบันทึก...' : 'ยืนยันการโอนเงิน'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
