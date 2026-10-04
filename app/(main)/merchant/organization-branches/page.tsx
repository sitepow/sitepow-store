'use client'

import { useState } from 'react'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconHierarchy2, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { BranchDialog } from './_components/BranchDialog'
import { BranchesTable } from './_components/BranchesTable'

export default function MerchantStoreSettingsBranchesPage() {
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
        title="จัดการสาขา"
        description="จัดการสาขาของร้านค้า กำหนดสาขาหลัก และเพิ่มสาขาย่อย"
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
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลสาขาของสาขาหรือร้านค้านี้"
        />
      ) : (
        <BranchesTable onEdit={handleEdit} />
      )}
    </Sidebar>
  )
}
