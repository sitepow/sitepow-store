'use client'

import { useEffect, useState } from 'react'
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

export const THAI_BANKS = [
  'ธนาคารกสิกรไทย (KBANK)',
  'ธนาคารไทยพาณิชย์ (SCB)',
  'ธนาคารกรุงเทพ (BBL)',
  'ธนาคารกรุงไทย (KTB)',
  'ธนาคารกรุงศรีอยุธยา (BAY)',
  'ธนาคารทหารไทยธนชาต (TTB)',
  'ธนาคารออมสิน (GSB)',
  'ธนาคารเพื่อการเกษตรและสหกรณ์การเกษตร (ธ.ก.ส.)',
  'อื่นๆ / เงินสด',
] as const

interface UsePartnerFormProps {
  storeId: string
  partner?: ProfitPartnerItem | null
  open: boolean
  setOpen: (open: boolean) => void
}

export function usePartnerForm({
  storeId,
  partner,
  open,
  setOpen,
}: UsePartnerFormProps) {
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
  const [bankName, setBankName] = useState<string>(THAI_BANKS[0])
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
        onError: (err: unknown) => {
          const message =
            err instanceof Error ? err.message : t('partners.dialog.saveError')
          toast.error(message)
        },
      },
    )
  }

  return {
    potentialMembers,
    selectedMemberId,
    setSelectedMemberId,
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
  }
}
