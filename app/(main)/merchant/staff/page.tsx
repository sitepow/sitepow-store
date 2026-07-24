'use client'

import { useStaffPermission } from '@/actions/hooks/staff'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconUserCog } from '@tabler/icons-react'

import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { StaffCreateDialog } from './_components/StaffCreateDialog'
import { StaffTable } from './_components/StaffTable'

export default function StaffPage() {
  const { canManageStoreSettings } = useStaffPermission()

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
            {canManageStoreSettings && <StaffCreateDialog />}
          </div>
        }
      />
      <StaffTable />
    </DashboardSidebar>
  )
}
