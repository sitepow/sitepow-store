'use client'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconUserCog } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { CustomerTable } from './_components/CustomerTable'

export default function CustomerPage() {
  const { selectedStoreId } = useStoreFilter()
  const { canManageCustomers, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconUserCog}
        title="จัดการลูกค้า"
        description="รายชื่อลูกค้าทั้งหมดของร้านค้า"
        endContent={<StoreSelectField />}
      />
      {selectedStoreId !== ALL_STORES &&
      !isPermissionLoading &&
      canManageCustomers === false ? (
        <ActionRequiredAlert
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการจัดการข้อมูลลูกค้าของสาขาหรือร้านค้านี้"
        />
      ) : (
        <CustomerTable />
      )}
    </DashboardSidebar>
  )
}
