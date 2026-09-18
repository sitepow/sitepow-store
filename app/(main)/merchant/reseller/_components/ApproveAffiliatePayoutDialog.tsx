'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useProcessAffiliatePayout } from '@/actions/hooks/affiliate'
import { formatCurrency } from '@/utils/pricing'
import { IconCheck, IconX } from '@tabler/icons-react'

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

import { AffiliatePayoutItem } from '@/types/affiliate'

interface ApproveAffiliatePayoutDialogProps {
  payout: AffiliatePayoutItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  storeId?: string
}

export function ApproveAffiliatePayoutDialog({
  payout,
  open,
  onOpenChange,
}: ApproveAffiliatePayoutDialogProps) {
  const t = useTranslations('merchant.reseller.affiliate.dialogs')
  const tAff = useTranslations('merchant.reseller.affiliate')
  const processPayoutMutation = useProcessAffiliatePayout()
  const [paymentProof, setPaymentProof] = useState('')
  const [note, setNote] = useState('')

  if (!payout) return null

  const customer = payout.affiliateAccount?.customer
  const customerName = customer
    ? `${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() ||
      customer.email
    : tAff('fallbacks.affiliate')

  const handleProcess = async (status: 'PAID' | 'REJECTED') => {
    try {
      const res = await processPayoutMutation.mutateAsync({
        payoutId: payout.id,
        input: {
          status,
          paymentProof: paymentProof || undefined,
          note: note || undefined,
        },
      })

      if (res.success) {
        onOpenChange(false)
      }
    } catch {
      // QueryProviders onError handles the error toast
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-bold sm:text-lg">
            {t('payoutTitle')}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t('payoutDesc')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 text-sm">
          {/* Summary Box */}
          <div className="border-border/80 bg-muted/30 space-y-2 rounded-xl border p-3.5">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                {tAff('columns.affiliate')}:
              </span>
              <span className="font-bold">{customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                {t('requestedAmount')}
              </span>
              <span className="text-primary text-base font-black">
                {formatCurrency(Number(payout.amount))}
              </span>
            </div>
            <div className="border-border/60 flex items-start justify-between gap-2 border-t pt-2 text-xs">
              <span className="text-muted-foreground">{t('channel')}</span>
              <span className="text-right font-medium">
                {payout.promptPayNumber ? (
                  <span className="text-foreground font-bold">
                    {tAff('fallbacks.promptPay')}: {payout.promptPayNumber}
                  </span>
                ) : (
                  <span>
                    {payout.bankName} {payout.bankAccountNo}
                    <br />({payout.bankAccountName})
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Payment Proof / Slip URL */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t('proofLabel')}</Label>
            <Input
              placeholder={t('proofPlaceholder')}
              value={paymentProof}
              onChange={(e) => setPaymentProof(e.target.value)}
            />
          </div>

          {/* Note */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t('noteLabel')}</Label>
            <Input
              placeholder={t('notePlaceholder')}
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            type="button"
            variant="destructive"
            onClick={() => handleProcess('REJECTED')}
            disabled={processPayoutMutation.isPending}
            className="gap-1 font-semibold"
          >
            <IconX className="size-4" />
            {t('rejectBtn')}
          </Button>

          <Button
            type="button"
            onClick={() => handleProcess('PAID')}
            disabled={processPayoutMutation.isPending}
            className="gap-1 font-bold shadow-xs"
          >
            <IconCheck className="size-4" />
            {t('confirmTransferBtn')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
