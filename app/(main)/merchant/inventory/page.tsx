'use client'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconBox, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { InventoryTable } from './_components/InventoryTable'

export default function MerchantInventoryPage() {
  const { selectedStoreId } = useStoreFilter()
  const { canViewInventory, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBox}
        title="คลังสินค้า"
        description="ตรวจสอบและอัปเดตจำนวนสต็อกสินค้าในแต่ละสาขา"
        endContent={<StoreSelectField />}
      />
      {selectedStoreId !== ALL_STORES &&
      !isPermissionLoading &&
      !canViewInventory ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลคลังสินค้าของสาขาหรือร้านค้านี้"
        />
      ) : (
        <InventoryTable />
      )}
    </Sidebar>
  )
}
