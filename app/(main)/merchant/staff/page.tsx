'use client'

import { useState } from 'react'

import { useStaffPermission } from '@/actions/hooks/staff'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconUserCog } from '@tabler/icons-react'

import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { StaffDialog } from './_components/StaffDialog'
import { StaffTable } from './_components/StaffTable'

export default function StaffPage() {
  const { canManageStoreSettings } = useStaffPermission()
  const [selectedStaffId, setSelectedStaffId] = useState<string | undefined>()
  const [open, setOpen] = useState(false)

  const handleEdit = (id: string) => {
    setSelectedStaffId(id)
    setOpen(true)
  }

  const handleAdd = () => {
    setSelectedStaffId(undefined)
    setOpen(true)
  }

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconUserCog}
        title="จัดการพนักงาน"
        description="จัดการพนักงานและบทบาทการเข้าถึงระบบของร้านค้า"
        endContent={
          <div className="flex items-end gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
            {canManageStoreSettings && (
              <StaffDialog
                staffId={selectedStaffId}
                open={open}
                setOpen={setOpen}
                onAdd={handleAdd}
              />
            )}
          </div>
        }
      />
      <StaffTable onEdit={handleEdit} />
    </DashboardSidebar>
  )
}
