'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconCoins } from '@tabler/icons-react'

import { SalaryType } from '@/generated/prisma/enums'
import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

interface StaffSalaryCompensationSectionProps {
  salaryType: SalaryType
  setSalaryType: (val: SalaryType) => void
  baseSalary: number
  setBaseSalary: (val: number) => void
  taxPercent: number
  setTaxPercent: (val: number) => void
  socialSecurity: boolean
  setSocialSecurity: (val: boolean) => void
}

export function StaffSalaryCompensationSection({
  salaryType,
  setSalaryType,
  baseSalary,
  setBaseSalary,
  taxPercent,
  setTaxPercent,
  socialSecurity,
  setSocialSecurity,
}: StaffSalaryCompensationSectionProps) {
  const tStaff = useTranslations('merchant.payroll.staff')
  const tDialog = useTranslations('merchant.payroll.staff.dialog')
  const tTypes = useTranslations('merchant.payroll.salaryTypes')

  return (
    <div className="border-border/70 bg-muted/20 space-y-4 rounded-xl border p-4">
      <h4 className="text-foreground flex items-center gap-1.5 text-sm font-semibold">
        <IconCoins className="text-primary size-4" />
        {tStaff('salaryType')}
      </h4>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field>
          <FieldLabel>{tDialog('salaryType')}</FieldLabel>
          <Select
            value={salaryType}
            onValueChange={(val) => setSalaryType(val as SalaryType)}
          >
            <SelectTrigger>
              <SelectValue placeholder={tDialog('salaryType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={SalaryType.MONTHLY}>
                {tTypes('MONTHLY')}
              </SelectItem>
              <SelectItem value={SalaryType.DAILY}>
                {tTypes('DAILY')}
              </SelectItem>
              <SelectItem value={SalaryType.HOURLY}>
                {tTypes('HOURLY')}
              </SelectItem>
              <SelectItem value={SalaryType.COMMISSION}>
                {tTypes('COMMISSION')}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>{tDialog('baseSalary')} *</FieldLabel>
          <Input
            type="number"
            min="0"
            step="100"
            value={baseSalary}
            onChange={(e) => setBaseSalary(Number(e.target.value))}
            required
          />
        </Field>

        <Field>
          <FieldLabel>{tDialog('taxPercent')}</FieldLabel>
          <Input
            type="number"
            min="0"
            max="100"
            step="1"
            placeholder={tDialog('taxPercentPlaceholder')}
            value={taxPercent}
            onChange={(e) => setTaxPercent(Number(e.target.value))}
          />
        </Field>

        <div className="bg-background flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <div className="text-xs font-medium">
              {tStaff('socialSecurity')}
            </div>
            <div className="text-muted-foreground text-[11px]">
              {tDialog('socialSecurityDesc')}
            </div>
          </div>
          <Switch
            checked={socialSecurity}
            onCheckedChange={setSocialSecurity}
          />
        </div>
      </div>
    </div>
  )
}
