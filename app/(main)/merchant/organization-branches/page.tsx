'use client'

import { useState } from 'react'

import { useTranslations } from 'next-intl'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconHierarchy2, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { BranchDialog } from './_components/BranchDialog'
import { BranchesTable } from './_components/BranchesTable'

export default function MerchantStoreSettingsBranchesPage() {
  const t = useTranslations('merchant.branches')
  const { selectedStoreId } = useStoreFilter()
  const {
    canViewBranches,
    canCreateBranches,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const [selectedBranchId, setSelectedBranchId] = useState<string | undefined>()
  const [open, setOpen] = useState(false)

  const handleEdit = (id: string) => {
    setSelectedBranchId(id)
    setOpen(true)
  }

  const handleAdd = () => {
    setSelectedBranchId(undefined)
    setOpen(true)
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconHierarchy2}
        title={t('title')}
        description={t('description')}
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            {!isPermissionLoading && canCreateBranches && (
              <BranchDialog
                branchId={selectedBranchId}
                open={open}
                setOpen={setOpen}
                onAdd={handleAdd}
              />
            )}
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewBranches ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title={t('noAccessTitle')}
          description={t('noAccessDescription')}
        />
      ) : (
        <BranchesTable onEdit={handleEdit} />
      )}
    </Sidebar>
  )
}
