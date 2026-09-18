'use client'

import { useTranslations } from 'next-intl'

import { IconPlus } from '@tabler/icons-react'

import { BranchSelectField } from '@/components/BranchSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Button } from '@/components/ui/button'

interface TableHeaderActionsProps {
  onAddZone: () => void
  onAddTable: () => void
}

export function TableHeaderActions({
  onAddZone,
  onAddTable,
}: TableHeaderActionsProps) {
  const t = useTranslations('merchant.tables')

  return (
    <div className="flex flex-wrap items-end gap-2">
      <StoreSelectField />
      <BranchSelectField />
      <Button variant="outline" size="sm" onClick={onAddZone}>
        <IconPlus className="mr-2 size-4" />
        {t('addZone')}
      </Button>
      <Button size="sm" onClick={onAddTable}>
        <IconPlus className="mr-2 size-4" />
        {t('addTable')}
      </Button>
    </div>
  )
}
