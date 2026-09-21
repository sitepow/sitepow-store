'use client'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconLock, IconShoppingCart } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { OrderTable } from './_components/OrderTable'

export default function OrderPage() {
  const { selectedStoreId } = useStoreFilter()
  const { canViewOrders, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconShoppingCart}
        title="จัดการออเดอร์"
        description="ติดตามและจัดการออเดอร์ทั้งหมดของร้านค้า"
        endContent={
          <div className="flex flex-wrap gap-2">
            <StoreSelectField />
            <BranchSelectField />
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewOrders ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลออเดอร์ของสาขาหรือร้านค้านี้"
        />
      ) : (
        <OrderTable />
      )}
    </Sidebar>
  )
}
