'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useUpdatePayoutStatus } from '@/actions/hooks/profit-sharing'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { PayoutStatus, ProfitPayoutItem } from '@/types/profit-sharing'
import {
  IconBuildingBank,
  IconCheck,
  IconClock,
  IconFileCheck,
  IconReceipt,
  IconUpload,
  IconX,
} from '@tabler/icons-react'

import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface PayoutSlipDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  storeId: string
  period: string
  settlementId?: string
  payout: ProfitPayoutItem | null
}

export function PayoutSlipDialog({
  open,
  setOpen,
  storeId,
  period,
  settlementId,
  payout,
}: PayoutSlipDialogProps) {
  const t = useTranslations('merchant.profitSharing')
  const { mutate: updatePayout, isPending } = useUpdatePayoutStatus(
    storeId,
    period,
  )
  const { format } = useMerchantCurrency()

  const [slipImage, setSlipImage] = useState<string>('')
  const [paymentNote, setPaymentNote] = useState<string>('')
  const [paidDate, setPaidDate] = useState<string>(
    new Date().toISOString().split('T')[0],
  )

  useEffect(() => {
    if (payout) {
      setSlipImage(payout.slipImage || '')
      setPaymentNote(payout.paymentNote || '')
      setPaidDate(
        payout.paidAt
          ? new Date(payout.paidAt).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0],
      )
    }
  }, [payout, open])

  if (!payout) return null

  const isPaid = payout.status === PayoutStatus.PAID

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onloadend = () => {
      setSlipImage(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleSave = () => {
    updatePayout(
      {
        payoutId: payout.id,
        status: PayoutStatus.PAID,
        details: {
          slipImage: slipImage || null,
          paymentNote: paymentNote.trim() || null,
          paidAt: new Date(paidDate).toISOString(),
        },
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(
              t('settlement.payoutSuccess', { name: payout.partnerName }),
            )
            setOpen(false)
          } else {
            toast.error(res.message || t('settlement.toastSaveFailed'))
          }
        },
        onError: (err: any) => {
          toast.error(err?.message || t('settlement.toastSaveFailed'))
        },
      },
    )
  }

  const handleRevertPending = () => {
    if (window.confirm(t('settlement.revertConfirm'))) {
      updatePayout(
        {
          payoutId: payout.id,
          status: PayoutStatus.PENDING,
          details: {
            paidAt: null,
          },
        },
        {
          onSuccess: (res) => {
            if (res.success) {
              toast.success(t('settlement.revertSuccess'))
              setOpen(false)
            } else {
              toast.error(res.message || t('settlement.revertFailed'))
            }
          },
        },
      )
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-md">
        <DialogHeader>
          <DialogHeaderIcon
            icon={IconFileCheck}
            title={
              isPaid ? t('settlement.slipDetail') : t('settlement.markPaid')
            }
          />
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Summary Box */}
          <div className="bg-muted/40 space-y-2 rounded-lg border p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-foreground text-sm font-semibold">
                {payout.partnerName}
              </span>
              <Badge variant={isPaid ? 'default' : 'secondary'}>
                {isPaid ? (
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                    <IconCheck className="size-3" /> {t('status.PAID')}
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <IconClock className="size-3" /> {t('status.PENDING')}
                  </span>
                )}
              </Badge>
            </div>

            <div className="flex items-baseline justify-between border-t pt-2">
              <span className="text-muted-foreground text-xs">
                {t('settlement.transferAmount')}
              </span>
              <span className="text-primary text-lg font-bold">
                {format(Number(payout.calculatedAmount))}
              </span>
            </div>

            {(payout.bankAccount || payout.promptPay) && (
              <div className="text-muted-foreground space-y-0.5 border-t pt-2 text-xs">
                {payout.bankName && (
                  <div className="text-foreground flex items-center gap-1 font-medium">
                    <IconBuildingBank className="size-3" /> {payout.bankName}
                  </div>
                )}
                {payout.bankAccount && (
                  <div>
                    {t('settlement.accountNumber')}{' '}
                    <span className="text-foreground font-medium">
                      {payout.bankAccount}
                    </span>
                  </div>
                )}
                {payout.bankAccountName && (
                  <div>
                    {t('settlement.accountName')} {payout.bankAccountName}
                  </div>
                )}
                {payout.promptPay && (
                  <div className="text-primary font-medium">
                    {t('settlement.promptPay')} {payout.promptPay}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Transfer Form or Slip Details */}
          <Field>
            <FieldLabel>{t('settlement.paidDate')}</FieldLabel>
            <Input
              type="date"
              value={paidDate}
              onChange={(e) => setPaidDate(e.target.value)}
              disabled={isPending}
            />
          </Field>

          <Field>
            <FieldLabel>{t('settlement.slipImage')}</FieldLabel>
            {slipImage ? (
              <div className="bg-muted/20 relative rounded-lg border p-2 text-center">
                <img
                  src={slipImage}
                  alt="Transfer Slip"
                  className="mx-auto max-h-64 rounded object-contain"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute top-3 right-3 size-7 rounded-full shadow"
                  onClick={() => setSlipImage('')}
                  title={t('settlement.deleteSlip')}
                  disabled={isPending}
                >
                  <IconX className="size-4" />
                </Button>
              </div>
            ) : (
              <div className="hover:bg-muted/30 flex flex-col items-center justify-center rounded-lg border border-dashed p-6 transition-colors">
                <IconUpload className="text-muted-foreground mb-2 size-8" />
                <label className="text-primary cursor-pointer text-sm font-medium hover:underline">
                  <span>{t('settlement.uploadSlip')}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={isPending}
                  />
                </label>
                <p className="text-muted-foreground mt-1 text-xs">
                  {t('settlement.supportedImageFormats')}
                </p>
              </div>
            )}
          </Field>

          <Field>
            <FieldLabel>{t('settlement.paymentNote')}</FieldLabel>
            <Textarea
              value={paymentNote}
              onChange={(e) => setPaymentNote(e.target.value)}
              placeholder={t('settlement.paymentNotePlaceholder')}
              rows={2}
              disabled={isPending}
            />
          </Field>

          <DialogFooter className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-between">
            {isPaid ? (
              <Button
                type="button"
                variant="ghost"
                className="text-muted-foreground hover:text-destructive text-xs"
                onClick={handleRevertPending}
                disabled={isPending}
              >
                {t('settlement.revertToPending')}
              </Button>
            ) : (
              <div />
            )}
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
              >
                {t('settlement.close')}
              </Button>
              <Button type="button" onClick={handleSave} disabled={isPending}>
                {isPending
                  ? t('settlement.saving')
                  : isPaid
                    ? t('settlement.updateData')
                    : t('settlement.confirmPayout')}
              </Button>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  )
}
