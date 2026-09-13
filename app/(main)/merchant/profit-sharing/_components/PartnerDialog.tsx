'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'

import { useTranslations } from 'next-intl'

import { useUpsertProfitPartner } from '@/actions/hooks/profit-sharing'
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('กรุณาระบุชื่อผู้รับส่วนแบ่งหรือหุ้นส่วน')
      return
    }

    if (shareValue <= 0) {
      toast.error('กรุณาระบุสัดส่วนหรือจำนวนเงินที่มากกว่า 0')
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
                ? 'อัปเดตข้อมูลหุ้นส่วนในฐานข้อมูลเรียบร้อยแล้ว'
                : 'เพิ่มหุ้นส่วนลงฐานข้อมูลเรียบร้อยแล้ว',
            )
            setOpen(false)
          } else {
            toast.error(res.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
          }
        },
        onError: (err: any) => {
          toast.error(err?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล')
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
          <Field>
            <FieldLabel>{t('partners.partnerName')} *</FieldLabel>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="เช่น คุณสมชาย (หุ้นส่วน 1) หรือ ค่าพัฒนาระบบ (ทีมเดฟ)"
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
                ? 'จำนวนเงินคงที่ต่อเดือน (บาท) *'
                : 'สัดส่วนเปอร์เซ็นต์ (%) *'}
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
                {shareType === ShareType.FIXED_MONTHLY ? '฿ / เดือน' : '%'}
              </span>
            </div>
            <p className="text-muted-foreground mt-1 text-xs">
              {shareType === ShareType.NET_PROFIT_PERCENT &&
                '💡 คำนวณจาก กำไรสุทธิ = (ยอดขายรวม - ต้นทุนสินค้า - ค่าใช้จ่ายร้าน)'}
              {shareType === ShareType.REVENUE_PERCENT &&
                '💡 คำนวณจาก ยอดขายรวมทั้งหมดของรอบเดือนก่อนหักต้นทุน'}
              {shareType === ShareType.FIXED_MONTHLY &&
                '💡 คิดเป็นยอดเงินประจำรายเดือน เช่น ค่าดูแลระบบ หรือ ค่าจ้างเหมา'}
            </p>
          </Field>

          <div className="bg-muted/30 space-y-3 rounded-lg border p-3">
            <h4 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
              ช่องทางการรับเงิน / บัญชีธนาคาร
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
                  placeholder="เช่น 123-4-56789-0"
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
                  placeholder="ชื่อบัญชีรับโอน"
                  disabled={isPending}
                />
              </Field>

              <Field>
                <FieldLabel>{t('partners.promptPay')}</FieldLabel>
                <Input
                  value={promptPay}
                  onChange={(e) => setPromptPay(e.target.value)}
                  placeholder="เบอร์โทรศัพท์ หรือ เลขบัตร ปชช."
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
              placeholder="เงื่อนไขหรือบันทึกเพิ่มเติม..."
              rows={2}
              disabled={isPending}
            />
          </Field>

          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <p className="text-sm font-medium">{t('partners.status')}</p>
              <p className="text-muted-foreground text-xs">
                {isActive
                  ? 'เปิดใช้งานและนำไปคิดในรอบการตัดรอบ'
                  : 'ระงับการจัดสรรเงินชั่วคราว'}
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
              ยกเลิก
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending
                ? 'กำลังบันทึก...'
                : partner
                  ? 'บันทึกการแก้ไข'
                  : 'เพิ่มผู้รับส่วนแบ่ง'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
