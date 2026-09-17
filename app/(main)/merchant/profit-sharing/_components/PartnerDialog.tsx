'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import {
  useStorePotentialPartners,
  useUpsertProfitPartner,
} from '@/actions/hooks/profit-sharing'
import {
  PartnerRole,
  ProfitPartnerItem,
  ShareType,
} from '@/types/profit-sharing'
import {
  IconCoins,
  IconPercentage,
  IconReceiptTax,
  IconUserCheck,
  IconUsers,
} from '@tabler/icons-react'

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

interface PartnerDialogProps {
  open: boolean
  setOpen: (open: boolean) => void
  storeId: string
  partner?: ProfitPartnerItem | null
}

const THAI_BANKS = [
  'ธนาคารกสิกรไทย (KBANK)',
  'ธนาคารไทยพาณิชย์ (SCB)',
  'ธนาคารกรุงเทพ (BBL)',
  'ธนาคารกรุงไทย (KTB)',
  'ธนาคารกรุงศรีอยุธยา (BAY)',
  'ธนาคารทหารไทยธนชาต (TTB)',
  'ธนาคารออมสิน (GSB)',
  'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)',
  'อื่นๆ / เงินสด',
]

export function PartnerDialog({
  open,
  setOpen,
  storeId,
  partner,
}: PartnerDialogProps) {
  const t = useTranslations('merchant.profitSharing')
  const { mutate: upsertPartner, isPending } = useUpsertProfitPartner()
  const { data: potentialMembers = [] } = useStorePotentialPartners(storeId)

  const [selectedMemberId, setSelectedMemberId] = useState<string>('custom')
  const [name, setName] = useState('')
  const [role, setRole] = useState<PartnerRole>(PartnerRole.SHAREHOLDER)
  const [shareType, setShareType] = useState<ShareType>(
    ShareType.NET_PROFIT_PERCENT,
  )
  const [shareValue, setShareValue] = useState<number>(10)
  const [bankName, setBankName] = useState(THAI_BANKS[0])
  const [bankAccount, setBankAccount] = useState('')
  const [bankAccountName, setBankAccountName] = useState('')
  const [promptPay, setPromptPay] = useState('')
  const [note, setNote] = useState('')
  const [isActive, setIsActive] = useState(true)

  useEffect(() => {
    if (partner) {
      setSelectedMemberId('custom')
      setName(partner.name)
      setRole(partner.role)
      setShareType(partner.shareType)
      setShareValue(Number(partner.shareValue))
      setBankName(partner.bankName || THAI_BANKS[0])
      setBankAccount(partner.bankAccount || '')
      setBankAccountName(partner.bankAccountName || '')
      setPromptPay(partner.promptPay || '')
      setNote(partner.note || '')
      setIsActive(partner.isActive)
    } else {
      setSelectedMemberId('custom')
      setName('')
      setRole(PartnerRole.SHAREHOLDER)
      setShareType(ShareType.NET_PROFIT_PERCENT)
      setShareValue(10)
      setBankName(THAI_BANKS[0])
      setBankAccount('')
      setBankAccountName('')
      setPromptPay('')
      setNote('')
      setIsActive(true)
    }
  }, [partner, open])

  const handleSelectMember = (val: string) => {
    setSelectedMemberId(val)
    if (val === 'custom') {
      return
    }

    const member = potentialMembers.find((m) => m.id === val)
    if (!member) return

    setName(member.name)
    if (member.sourceType === 'OWNER') {
      setRole(PartnerRole.SHAREHOLDER)
      setNote(t('partners.dialog.ownerNote'))
    } else {
      setRole(PartnerRole.SHAREHOLDER)
      setNote(
        member.position
          ? t('partners.dialog.positionPrefix', { position: member.position })
          : '',
      )
    }

    if (member.bankName) setBankName(member.bankName)
    if (member.bankAccount) setBankAccount(member.bankAccount)
    if (member.bankAccountName) setBankAccountName(member.bankAccountName)
    if (member.promptPay) setPromptPay(member.promptPay)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error(t('partners.dialog.nameRequired'))
      return
    }

    if (shareValue <= 0) {
      toast.error(t('partners.dialog.valueRequired'))
      return
    }

    upsertPartner(
      {
        id: partner?.id,
        storeId,
        name: name.trim(),
        role,
        shareType,
        shareValue,
        bankName,
        bankAccount: bankAccount.trim() || null,
        bankAccountName: bankAccountName.trim() || null,
        promptPay: promptPay.trim() || null,
        note: note.trim() || null,
        isActive,
      },
      {
        onSuccess: (res) => {
          if (res.success) {
            toast.success(
              partner
                ? t('partners.dialog.updateSuccess')
                : t('partners.dialog.createSuccess'),
            )
            setOpen(false)
          } else {
            toast.error(res.message || t('partners.dialog.saveError'))
          }
        },
        onError: (err: any) => {
          toast.error(err?.message || t('partners.dialog.saveError'))
        },
      },
    )
  }

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
              onChange={(e) => {
                setName(e.target.value)
                setSelectedMemberId('custom')
              }}
              placeholder={t('partners.dialog.namePlaceholder')}
              required
              disabled={isPending}
            />
          </Field>

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
