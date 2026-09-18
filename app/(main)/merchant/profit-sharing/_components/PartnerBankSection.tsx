'use client'

import React from 'react'
import { useTranslations } from 'next-intl'

import { THAI_BANKS } from '../_hooks/use-partner-form'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PartnerBankSectionProps {
  bankName: string
  setBankName: (val: string) => void
  bankAccount: string
  setBankAccount: (val: string) => void
  bankAccountName: string
  setBankAccountName: (val: string) => void
  promptPay: string
  setPromptPay: (val: string) => void
  isPending: boolean
}

export function PartnerBankSection({
  bankName,
  setBankName,
  bankAccount,
  setBankAccount,
  bankAccountName,
  setBankAccountName,
  promptPay,
  setPromptPay,
  isPending,
}: PartnerBankSectionProps) {
  const t = useTranslations('merchant.profitSharing')

  return (
    <div className="bg-muted/30 space-y-3 rounded-lg border p-3">
      <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
        {t('partners.dialog.bankSection')}
      </h4>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel>{t('partners.bank')}</FieldLabel>
          <Select
            value={bankName}
            onValueChange={setBankName}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {THAI_BANKS.map((bank) => (
                <SelectItem key={bank} value={bank}>
                  {bank}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>{t('partners.bankAccount')}</FieldLabel>
          <Input
            value={bankAccount}
            onChange={(e) => setBankAccount(e.target.value)}
            placeholder={t('partners.dialog.bankAccountPlaceholder')}
            disabled={isPending}
          />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel>{t('partners.accountName')}</FieldLabel>
          <Input
            value={bankAccountName}
            onChange={(e) => setBankAccountName(e.target.value)}
            placeholder={t('partners.dialog.bankAccountNamePlaceholder')}
            disabled={isPending}
          />
        </Field>

        <Field>
          <FieldLabel>{t('partners.promptPay')}</FieldLabel>
          <Input
            value={promptPay}
            onChange={(e) => setPromptPay(e.target.value)}
            placeholder={t('partners.dialog.promptPayPlaceholder')}
            disabled={isPending}
          />
        </Field>
      </div>
    </div>
  )
}
