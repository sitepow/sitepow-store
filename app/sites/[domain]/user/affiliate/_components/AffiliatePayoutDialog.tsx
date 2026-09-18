'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { IconBuildingBank } from '@tabler/icons-react'

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

interface AffiliatePayoutDialogProps {
  isOpen: boolean
  onClose: () => void
  availableBalance: number
  minWithdrawal: number
  initialPromptPay?: string | null
  initialBankName?: string | null
  initialBankAccountNo?: string | null
  initialBankAccountName?: string | null
  formatCurrency: (amount: number, currency?: string) => string
  convert: (amount: number) => number
  currentCurrency?: string
  onSubmit: (data: {
    amount: number
    promptPayNumber: string
    bankName: string
    bankAccountNo: string
    bankAccountName: string
  }) => void
  isSubmitting: boolean
}

export function AffiliatePayoutDialog({
  isOpen,
  onClose,
  availableBalance,
  minWithdrawal,
  initialPromptPay,
  initialBankName,
  initialBankAccountNo,
  initialBankAccountName,
  formatCurrency,
  convert,
  currentCurrency,
  onSubmit,
  isSubmitting,
}: AffiliatePayoutDialogProps) {
  const t = useTranslations('customer.affiliate')
  const [payoutAmount, setPayoutAmount] = useState('')
  const [promptPayNumber, setPromptPayNumber] = useState('')
  const [bankName, setBankName] = useState('')
  const [bankAccountNo, setBankAccountNo] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')

  useEffect(() => {
    if (isOpen) {
      setPayoutAmount('')
      setPromptPayNumber(initialPromptPay || '')
      setBankName(initialBankName || '')
      setBankAccountNo(initialBankAccountNo || '')
      setBankAccountName(initialBankAccountName || '')
    }
  }, [
    isOpen,
    initialPromptPay,
    initialBankName,
    initialBankAccountNo,
    initialBankAccountName,
  ])

  const handleSubmit = () => {
    const amountNum = parseFloat(payoutAmount)
    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error(t('toasts.invalidAmount'))
      return
    }
    if (amountNum < minWithdrawal) {
      toast.error(t('toasts.minWithdrawal', { min: minWithdrawal }))
      return
    }
    if (amountNum > availableBalance) {
      toast.error(t('toasts.insufficientBalance'))
      return
    }
    if (!promptPayNumber && (!bankName || !bankAccountNo)) {
      toast.error(t('toasts.requireBankOrPromptPay'))
      return
    }

    onSubmit({
      amount: amountNum,
      promptPayNumber,
      bankName,
      bankAccountNo,
      bankAccountName,
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-bold">
            <IconBuildingBank className="text-primary size-5" />
            {t('payoutDialog.title')}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {t('payoutDialog.description', {
              balance: formatCurrency(
                convert(availableBalance),
                currentCurrency,
              ),
              min: minWithdrawal,
            })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t('payoutDialog.amountLabel')}
            </Label>
            <Input
              type="number"
              min={minWithdrawal}
              max={availableBalance}
              placeholder={t('payoutDialog.amountPlaceholder', {
                min: minWithdrawal,
              })}
              value={payoutAmount}
              onChange={(e) => setPayoutAmount(e.target.value)}
              className="text-base font-bold"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t('payoutDialog.promptPayLabel')}
            </Label>
            <Input
              placeholder={t('bankForm.promptPayPlaceholder')}
              value={promptPayNumber}
              onChange={(e) => setPromptPayNumber(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t('payoutDialog.bankLabel')}
              </Label>
              <Input
                placeholder={t('bankForm.bankNamePlaceholder')}
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {t('payoutDialog.accountNoLabel')}
              </Label>
              <Input
                placeholder={t('bankForm.accountNoPlaceholder')}
                value={bankAccountNo}
                onChange={(e) => setBankAccountNo(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">
              {t('payoutDialog.accountNameLabel')}
            </Label>
            <Input
              placeholder={t('bankForm.accountNamePlaceholder')}
              value={bankAccountName}
              onChange={(e) => setBankAccountName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={onClose}>
            {t('payoutDialog.cancel')}
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="font-bold"
          >
            {t('payoutDialog.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
