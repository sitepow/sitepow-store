'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconReceiptTax, IconUserCheck } from '@tabler/icons-react'

import { ProfitPartnerItem } from '@/types/profit-sharing'
import { DialogHeaderIcon } from '@/components/DialogHeaderIcon'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
} from '@/components/ui/dialog'
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
import { Textarea } from '@/components/ui/textarea'

import { usePartnerForm } from '../_hooks/use-partner-form'
import { PartnerBankSection } from './PartnerBankSection'
import { PartnerShareConfigSection } from './PartnerShareConfigSection'

interface PartnerDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  storeId: string
  partner?: ProfitPartnerItem | null
}

export function PartnerDialog({
  open,
  setOpen,
  storeId,
  partner,
}: PartnerDialogProps) {
  const t = useTranslations('merchant.profitSharing')

  const {
    potentialMembers,
    selectedMemberId,
    name,
    setName,
    role,
    setRole,
    shareType,
    setShareType,
    shareValue,
    setShareValue,
    bankName,
    setBankName,
    bankAccount,
    setBankAccount,
    bankAccountName,
    setBankAccountName,
    promptPay,
    setPromptPay,
    note,
    setNote,
    isActive,
    setIsActive,
    isPending,
    handleSelectMember,
    handleSubmit,
  } = usePartnerForm({
    storeId,
    partner,
    open,
    setOpen,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogHeaderIcon
            icon={partner ? IconUserCheck : IconReceiptTax}
            title={
              partner ? t('partners.editPartner') : t('partners.addPartner')
            }
          />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {!partner && potentialMembers.length > 0 && (
            <Field>
              <FieldLabel className="text-foreground font-medium">
                {t('partners.dialog.selectFromStore')}
              </FieldLabel>
              <Select
                value={selectedMemberId}
                onValueChange={handleSelectMember}
                disabled={isPending}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={t(
                      'partners.dialog.selectFromStorePlaceholder',
                    )}
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">
                    {t('partners.dialog.customMember')}
                  </SelectItem>
                  {potentialMembers.map((m) => {
                    const prefix =
                      m.sourceType === 'OWNER'
                        ? t('partners.dialog.ownerPrefix')
                        : t('partners.dialog.staffPrefix')
                    return (
                      <SelectItem key={m.id} value={m.id}>
                        {prefix} {m.name}
                        {m.position ? ` (${m.position})` : ''}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
            </Field>
          )}

          <Field>
            <FieldLabel>{t('partners.partnerName')} *</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('partners.dialog.namePlaceholder')}
              required
              disabled={isPending}
            />
          </Field>

          <PartnerShareConfigSection
            role={role}
            setRole={setRole}
            shareType={shareType}
            setShareType={setShareType}
            shareValue={shareValue}
            setShareValue={setShareValue}
            isPending={isPending}
          />

          <PartnerBankSection
            bankName={bankName}
            setBankName={setBankName}
            bankAccount={bankAccount}
            setBankAccount={setBankAccount}
            bankAccountName={bankAccountName}
            setBankAccountName={setBankAccountName}
            promptPay={promptPay}
            setPromptPay={setPromptPay}
            isPending={isPending}
          />

          <Field>
            <FieldLabel>{t('partners.note')}</FieldLabel>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('partners.dialog.notePlaceholder')}
              rows={2}
              disabled={isPending}
            />
          </Field>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">{t('partners.status')}</p>
              <p className="text-muted-foreground text-xs">
                {isActive
                  ? t('partners.dialog.activeDesc')
                  : t('partners.dialog.inactiveDesc')}
              </p>
            </div>
            <Switch
              checked={isActive}
              onCheckedChange={setIsActive}
              disabled={isPending}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={isPending}
            >
              {t('partners.dialog.cancel')}
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? t('partners.dialog.saving')
                : partner
                  ? t('partners.dialog.saveEdit')
                  : t('partners.dialog.addSubmit')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
