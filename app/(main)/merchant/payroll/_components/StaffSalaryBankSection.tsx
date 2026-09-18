'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconBuildingBank } from '@tabler/icons-react'

import { THAI_BANKS } from '../_hooks/use-staff-salary-form'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface StaffSalaryBankSectionProps {
  bankName: string
  setBankName: (val: string) => void
  bankAccountNumber: string
  setBankAccountNumber: (val: string) => void
  bankAccountName: string
  setBankAccountName: (val: string) => void
  promptpayNumber: string
  setPromptpayNumber: (val: string) => void
}

export function StaffSalaryBankSection({
  bankName,
  setBankName,
  bankAccountNumber,
  setBankAccountNumber,
  bankAccountName,
  setBankAccountName,
  promptpayNumber,
  setPromptpayNumber,
}: StaffSalaryBankSectionProps) {
  const tStaff = useTranslations('merchant.payroll.staff')
  const tDialog = useTranslations('merchant.payroll.staff.dialog')

  return (
    <div className="border-border/70 bg-muted/20 space-y-4 rounded-xl border p-4">
      <h4 className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
        <IconBuildingBank className="text-primary size-4" />
        {tStaff('bankInfo')}
      </h4>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field className="sm:col-span-2">
          <FieldLabel>{tDialog('bankName')}</FieldLabel>
          <Select value={bankName} onValueChange={setBankName}>
            <SelectTrigger>
              <SelectValue placeholder={tDialog('bankName')} />
            </SelectTrigger>
            <SelectContent>
              {THAI_BANKS.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>{tDialog('bankAccountNumber')}</FieldLabel>
          <Input
            placeholder={tDialog('bankAccountPlaceholder')}
            value={bankAccountNumber}
            onChange={(e) => setBankAccountNumber(e.target.value)}
          />
        </Field>

        <Field>
          <FieldLabel>{tDialog('bankAccountName')}</FieldLabel>
          <Input
            placeholder={tDialog('bankAccountNamePlaceholder')}
            value={bankAccountName}
            onChange={(e) => setBankAccountName(e.target.value)}
          />
        </Field>

        <Field className="sm:col-span-2">
          <FieldLabel>{tDialog('promptpayNumber')}</FieldLabel>
          <Input
            placeholder={tDialog('promptpayPlaceholder')}
            value={promptpayNumber}
            onChange={(e) => setPromptpayNumber(e.target.value)}
          />
        </Field>
      </div>
    </div>
  )
}
