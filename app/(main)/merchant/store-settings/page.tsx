'use client'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconBuildingStore } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Skeleton } from '@/components/ui/skeleton'

import { StoreCreateDialog } from './_components/StoreCreateDialog'
import { StoreTable } from './_components/StoreTable'

export default function MerchantStoreSettingsPage() {
  const {
    canViewStore,
    canCreateStore,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      {isPermissionLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : !canViewStore ? (
        <ActionRequiredAlert
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลร้านค้า"
        />
      ) : (
        <>
          <PageTabHeader
            icon={IconBuildingStore}
            title="จัดการร้านค้า"
            description="จัดการข้อมูลหน้าร้าน สลับเข้าสู่ระบบหลังบ้าน หรือเปิดร้านค้าใหม่เพื่อเริ่มธุรกิจเพิ่ม"
            endContent={canCreateStore ? <StoreCreateDialog /> : null}
          />
          <StoreTable />
        </>
      )}
    </DashboardSidebar>
  )
}
