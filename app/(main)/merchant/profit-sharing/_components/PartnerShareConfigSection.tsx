'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { PartnerRole, ShareType } from '@/types/profit-sharing'

import { Field, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface PartnerShareConfigSectionProps {
  role: PartnerRole
  setRole: (val: PartnerRole) => void
  shareType: ShareType
  setShareType: (val: ShareType) => void
  shareValue: number
  setShareValue: (val: number) => void
  isPending: boolean
}

export function PartnerShareConfigSection({
  role,
  setRole,
  shareType,
  setShareType,
  shareValue,
  setShareValue,
  isPending,
}: PartnerShareConfigSectionProps) {
  const t = useTranslations('merchant.profitSharing')

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field>
          <FieldLabel>{t('partners.partnerRole')}</FieldLabel>
          <Select
            value={role}
            onValueChange={(val) => setRole(val as PartnerRole)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={PartnerRole.SHAREHOLDER}>
                {t('roles.SHAREHOLDER')}
              </SelectItem>
              <SelectItem value={PartnerRole.DEVELOPER}>
                {t('roles.DEVELOPER')}
              </SelectItem>
              <SelectItem value={PartnerRole.SYSTEM}>
                {t('roles.SYSTEM')}
              </SelectItem>
              <SelectItem value={PartnerRole.MARKETING}>
                {t('roles.MARKETING')}
              </SelectItem>
              <SelectItem value={PartnerRole.INVESTOR}>
                {t('roles.INVESTOR')}
              </SelectItem>
              <SelectItem value={PartnerRole.OTHER}>
                {t('roles.OTHER')}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>{t('partners.shareType')}</FieldLabel>
          <Select
            value={shareType}
            onValueChange={(val) => setShareType(val as ShareType)}
            disabled={isPending}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ShareType.NET_PROFIT_PERCENT}>
                {t('shareTypes.NET_PROFIT_PERCENT')}
              </SelectItem>
              <SelectItem value={ShareType.REVENUE_PERCENT}>
                {t('shareTypes.REVENUE_PERCENT')}
              </SelectItem>
              <SelectItem value={ShareType.FIXED_MONTHLY}>
                {t('shareTypes.FIXED_MONTHLY')}
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      <Field>
        <FieldLabel>
          {shareType === ShareType.FIXED_MONTHLY
            ? t('partners.dialog.fixedMonthlyLabel')
            : t('partners.dialog.percentLabel')}
        </FieldLabel>
        <div className="relative">
          <Input
            type="number"
            step={shareType === ShareType.FIXED_MONTHLY ? '1' : '0.1'}
            min="0.01"
            max={shareType === ShareType.FIXED_MONTHLY ? undefined : 100}
            value={shareValue}
            onChange={(e) => setShareValue(parseFloat(e.target.value) || 0)}
            required
            disabled={isPending}
          />
          <span className="text-muted-foreground absolute top-2.5 right-3 text-sm font-medium">
            {shareType === ShareType.FIXED_MONTHLY
              ? t('partners.dialog.fixedMonthlyUnit')
              : t('partners.dialog.percentUnit')}
          </span>
        </div>
        <p className="text-muted-foreground mt-1 text-xs">
          {shareType === ShareType.NET_PROFIT_PERCENT &&
            t('partners.dialog.netProfitHint')}
          {shareType === ShareType.REVENUE_PERCENT &&
            t('partners.dialog.revenueHint')}
          {shareType === ShareType.FIXED_MONTHLY &&
            t('partners.dialog.fixedHint')}
        </p>
      </Field>
    </>
  )
}
