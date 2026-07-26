'use client'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconBuildingStore } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { StoreCreateDialog } from './_components/StoreCreateDialog'
import { StoreTable } from './_components/StoreTable'

export default function MerchantStoreSettingsPage() {
  const {
    isOwner,
    isAdmin,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const hasAccess = isOwner || isAdmin

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBuildingStore}
        title="จัดการร้านค้า"
        description="จัดการข้อมูลหน้าร้าน สลับเข้าสู่ระบบหลังบ้าน หรือเปิดร้านค้าใหม่เพื่อเริ่มธุรกิจเพิ่ม"
        endContent={hasAccess ? <StoreCreateDialog /> : null}
      />
      {!isPermissionLoading && !hasAccess ? (
        <ActionRequiredAlert
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการจัดการข้อมูลร้านค้าหรือสร้างร้านค้าใหม่ หน้านี้สำหรับเจ้าของร้านและผู้ดูแลระบบเท่านั้น"
        />
      ) : (
        <StoreTable />
      )}
    </DashboardSidebar>
  )
}
