'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'
import Image from 'next/image'

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
  const t = useTranslations('merchant.payroll.settlement')
  const tStatus = useTranslations('merchant.payroll.status')
  const tStaff = useTranslations('merchant.payroll.staff')
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
        toast.error(t('maxSizeError'))
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
            ? t('payoutSuccess', { name: item.employeeName })
            : t('payoutReverted', { name: item.employeeName }),
        )
        onOpenChange(false)
      } else {
        toast.error(res.message || t('payoutFailed'))
      }
    } catch {
      toast.error(t('payoutGeneralError'))
    }
  }

  const isPaid = item.status === PayoutStatus.PAID

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <IconReceipt className="text-primary size-5" />
            {t('slipDialogTitle')}
          </DialogTitle>
          <DialogDescription>{t('slipDialogDesc')}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Employee & Payout Amount Box */}
          <div className="border-border/70 bg-muted/20 space-y-3 rounded-xl border p-4">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="text-foreground text-base font-semibold">
                  {item.employeeName}
                </h4>
                <p className="text-muted-foreground text-xs">
                  {item.position || t('defaultPosition')}
                  {item.department ? ` • ${item.department}` : ''}
                </p>
              </div>
              <Badge
                variant={isPaid ? 'default' : 'secondary'}
                className={
                  isPaid
                    ? 'border-emerald-200 bg-emerald-500/10 text-emerald-600'
                    : 'border-amber-200 bg-amber-500/10 text-amber-600'
                }
              >
                {isPaid ? (
                  <span className="flex items-center gap-1">
                    <IconCheck className="size-3" /> {tStatus('paid')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <IconClock className="size-3" /> {tStatus('pending')}
                  </span>
                )}
              </Badge>
            </div>

            <div className="bg-background border-border/50 flex items-center justify-between rounded-lg border p-3">
              <span className="text-muted-foreground text-xs">
                {t('netSalaryLabel')}
              </span>
              <span className="text-primary text-xl font-bold">
                {formatCurrency(item.netSalary)}
              </span>
            </div>

            {/* Bank details */}
            <div className="text-muted-foreground border-border/50 space-y-1 border-t pt-1 text-xs">
              {item.bankName && (
                <div className="text-foreground flex items-center gap-1 font-medium">
                  <IconBuildingBank className="size-3.5" />
                  {item.bankName}
                </div>
              )}
              {item.bankAccount && (
                <div>
                  {t('accountNumber')} {item.bankAccount} (
                  {item.bankAccountName || item.employeeName})
                </div>
              )}
              {item.promptPay && (
                <div>
                  {t('promptPay')} {item.promptPay}
                </div>
              )}
            </div>
          </div>

          {/* Form fields */}
          <div className="space-y-3">
            <div>
              <Label className="text-xs">{t('paidDateLabel')}</Label>
              <Input
                type="date"
                value={paidDate}
                onChange={(e) => setPaidDate(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">{t('uploadSlip')}</Label>
              {slipImage ? (
                <div className="mt-2 space-y-2">
                  <div className="bg-muted relative h-48 w-full overflow-hidden rounded-lg border">
                    <Image
                      src={slipImage}
                      alt="Transfer slip"
                      fill
                      className="object-contain"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 size-7 rounded-full shadow-md"
                      onClick={() => setSlipImage('')}
                      title={t('deleteSlipImage')}
                    >
                      <IconX className="size-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <label className="border-border/80 bg-muted/10 hover:bg-muted/30 mt-1 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-5 text-center transition-colors">
                  <IconUpload className="text-muted-foreground size-7" />
                  <span className="text-foreground mt-2 text-xs font-medium">
                    {t('uploadPrompt')}
                  </span>
                  <span className="text-muted-foreground text-[11px]">
                    {t('supportedImageFormats')}
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
              <Label className="text-xs">{t('paymentNoteLabel')}</Label>
              <Textarea
                rows={2}
                placeholder={t('paymentNotePlaceholder')}
                value={paymentNote}
                onChange={(e) => setPaymentNote(e.target.value)}
                className="mt-1 text-xs"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2 sm:gap-0">
          {isPaid && (
            <Button
              type="button"
              variant="outline"
              className="border-rose-200 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
              disabled={updateMutation.isPending}
              onClick={() => handleSave(false)}
            >
              {t('cancelPaid')}
            </Button>
          )}
          <Button
            type="button"
            className="bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={updateMutation.isPending}
            onClick={() => handleSave(true)}
          >
            <IconCheck className="mr-1 size-4" />
            {updateMutation.isPending ? t('saving') : t('confirmPaid')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
