'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AffiliateBankFormProps {
  initialPromptPay?: string | null
  initialBankName?: string | null
  initialBankAccountNo?: string | null
  initialBankAccountName?: string | null
  onSave: (data: {
    promptPayNumber: string
    bankName: string
    bankAccountNo: string
    bankAccountName: string
  }) => void
  isSaving: boolean
}

export function AffiliateBankForm({
  initialPromptPay,
  initialBankName,
  initialBankAccountNo,
  initialBankAccountName,
  onSave,
  isSaving,
}: AffiliateBankFormProps) {
  const t = useTranslations('customer.affiliate')
  const [promptPayNumber, setPromptPayNumber] = useState(initialPromptPay || '')
  const [bankName, setBankName] = useState(initialBankName || '')
  const [bankAccountNo, setBankAccountNo] = useState(initialBankAccountNo || '')
  const [bankAccountName, setBankAccountName] = useState(
    initialBankAccountName || '',
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      promptPayNumber,
      bankName,
      bankAccountNo,
      bankAccountName,
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t('bankForm.title')}</CardTitle>
        <CardDescription className="text-xs">
          {t('bankForm.description')}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="max-w-xl space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">{t('bankForm.promptPay')}</Label>
              <Input
                placeholder={t('bankForm.promptPayPlaceholder')}
                value={promptPayNumber}
                onChange={(e) => setPromptPayNumber(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('bankForm.bankName')}</Label>
              <Input
                placeholder={t('bankForm.bankNamePlaceholder')}
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">{t('bankForm.accountNo')}</Label>
              <Input
                placeholder={t('bankForm.accountNoPlaceholder')}
                value={bankAccountNo}
                onChange={(e) => setBankAccountNo(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">{t('bankForm.accountName')}</Label>
              <Input
                placeholder={t('bankForm.accountNamePlaceholder')}
                value={bankAccountName}
                onChange={(e) => setBankAccountName(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" disabled={isSaving} className="font-bold">
            {t('bankForm.save')}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
