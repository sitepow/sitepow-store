'use client'

import Link from 'next/link'
import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import { IconClipboardList, IconLock, IconPlus } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { StoreSelectField } from '@/components/form/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'

import { ProcurementTable } from './_components/ProcurementTable'

export default function MerchantProcurementPage() {
  const { selectedStoreId } = useStoreFilter()
  const { canViewInventory, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconClipboardList}
        title="ใบสั่งซื้อสินค้า / รายการซื้อของ"
        description="จัดการใบสั่งซื้อสินค้า ตรวจสอบสถานะการซื้อหน้าร้าน/ตลาด และเปิดเช็คลิสต์บนมือถือ"
        endContent={
          <div className="flex flex-wrap items-end gap-3 sm:gap-5">
            <StoreSelectField />
            <Button asChild variant="outline">
              <Link href="/merchant/store-settings/products">
                <IconPlus />
                สร้างใบสั่งซื้อจากสินค้า
              </Link>
            </Button>
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewInventory ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลการจัดซื้อของสาขาหรือร้านค้านี้"
        />
      ) : (
        <ProcurementTable />
      )}
    </Sidebar>
  )
}
