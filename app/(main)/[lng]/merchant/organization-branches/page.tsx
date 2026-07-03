'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconGitBranch } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { BranchCreateDialog } from './_components/BranchCreateDialog'
import { BranchesTable } from './_components/BranchesTable'

export default function MerchantStoreSettingsBranchesPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconGitBranch}
        title="รายการสาขาทั้งหมด"
        description="จัดการสาขาของร้านค้า กำหนดสาขาหลัก และเพิ่มสาขาย่อย"
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            <BranchCreateDialog />
          </div>
        }
      />
      <BranchesTable />
    </DashboardSidebar>
  )
}
