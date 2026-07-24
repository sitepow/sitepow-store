'use client'

import { useState } from 'react'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconHierarchy2 } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { BranchDialog } from './_components/BranchDialog'
import { BranchesTable } from './_components/BranchesTable'

export default function MerchantStoreSettingsBranchesPage() {
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
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconHierarchy2}
        title="จัดการสาขา"
        description="จัดการสาขาของร้านค้า กำหนดสาขาหลัก และเพิ่มสาขาย่อย"
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            <BranchDialog
              branchId={selectedBranchId}
              open={open}
              setOpen={setOpen}
              onAdd={handleAdd}
            />
          </div>
        }
      />
      <BranchesTable onEdit={handleEdit} />
    </DashboardSidebar>
  )
}
