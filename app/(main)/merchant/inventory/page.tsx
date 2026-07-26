'use client'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconBox } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { InventoryTable } from './_components/InventoryTable'

export default function MerchantInventoryPage() {
  const { selectedStoreId } = useStoreFilter()
  const { canManageInventory, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBox}
        title="คลังสินค้า"
        description="ตรวจสอบและอัปเดตจำนวนสต็อกสินค้าในแต่ละสาขา"
        endContent={<StoreSelectField />}
      />
      {selectedStoreId !== ALL_STORES &&
      !isPermissionLoading &&
      !canManageInventory ? (
        <ActionRequiredAlert
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการจัดการข้อมูลคลังสินค้าของสาขาหรือร้านค้านี้"
        />
      ) : (
        <InventoryTable />
      )}
    </DashboardSidebar>
  )
}
