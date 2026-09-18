'use client'

import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useTranslations } from 'next-intl'

import {
  useDeleteProfitPartner,
  useProfitPartners,
  useToggleProfitPartnerStatus,
} from '@/actions/hooks/profit-sharing'
import { Card, CardContent } from '@/components/ui/card'
import { ProfitPartnerItem } from '@/types/profit-sharing'

import { PartnerAllocationCard } from './PartnerAllocationCard'
import { PartnerDesktopTable } from './PartnerDesktopTable'
import { PartnerDialog } from './PartnerDialog'
import { PartnerMobileList } from './PartnerMobileList'

interface PartnerListTableProps {
  storeId: string
}

export function PartnerListTable({ storeId }: PartnerListTableProps) {
  const t = useTranslations('merchant.profitSharing')

  const { data: partners = [], isLoading } = useProfitPartners(storeId)
  const { mutate: deletePartner } = useDeleteProfitPartner()
  const { mutate: togglePartnerStatus } = useToggleProfitPartnerStatus()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] =
    useState<ProfitPartnerItem | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleOpenAdd = () => {
    setSelectedPartner(null)
    setDialogOpen(true)
  }

  const handleOpenEdit = (partner: ProfitPartnerItem) => {
    setSelectedPartner(partner)
    setDialogOpen(true)
  }

  const handleDelete = (partner: ProfitPartnerItem) => {
    if (window.confirm(t('partners.deletePrompt', { name: partner.name }))) {
      deletePartner(
        { id: partner.id, storeId },
        {
          onSuccess: (res) => {
            if (res.success) {
              toast.success(t('partners.deleteSuccess'))
            } else {
              toast.error(res.message || t('partners.deleteFailed'))
            }
          },
        },
      )
    }
  }

  const handleToggleStatus = (partner: ProfitPartnerItem) => {
    togglePartnerStatus({ id: partner.id, storeId })
  }

  const handleCopyAccount = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    toast.success(t('partners.copiedAccount'))
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Allocation Summary Card */}
      <PartnerAllocationCard partners={partners} onOpenAdd={handleOpenAdd} />

      {/* Partner Table / Cards */}
      <Card>
        <CardContent className="p-0">
          <PartnerMobileList
            partners={partners}
            isLoading={isLoading}
            copiedId={copiedId}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onCopyAccount={handleCopyAccount}
          />
          <PartnerDesktopTable
            partners={partners}
            isLoading={isLoading}
            copiedId={copiedId}
            onOpenAdd={handleOpenAdd}
            onOpenEdit={handleOpenEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
            onCopyAccount={handleCopyAccount}
          />
        </CardContent>
      </Card>

      {/* Dialog for Add / Edit */}
      <PartnerDialog
        open={dialogOpen}
        setOpen={setDialogOpen}
        storeId={storeId}
        partner={selectedPartner}
      />
    </div>
  )
}
