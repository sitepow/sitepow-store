'use client'

import Link from 'next/link'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import {
  IconBox,
  IconClipboardList,
  IconLock,
  IconPlus,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { StoreSelectField } from '@/components/form/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { PurchaseOrderHistoryDialog } from '@/components/procurement'

import { ProductsTable } from './_components/ProductsTable'

export default function MerchantStoreSettingsProductsPage() {
  const { selectedStoreId } = useStoreFilter()
  const {
    canViewProducts,
    canCreateProducts,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBox}
        title="สินค้าทั้งหมด"
        description="จัดการข้อมูลสินค้า ตรวจสอบสถานะ และอัปเดตสต็อกสินค้าของร้านค้าคุณ"
        endContent={
          <div className="flex flex-wrap items-end gap-3 sm:gap-5">
            <StoreSelectField />
            {selectedStoreId !== ALL_STORES && (
              <>
                <Button asChild variant="outline">
                  <Link href="/merchant/procurement">
                    <IconClipboardList />
                    รายการสั่งซื้อสินค้า
                  </Link>
                </Button>
                <PurchaseOrderHistoryDialog storeId={selectedStoreId} />
              </>
            )}
            {canCreateProducts && (
              <Button asChild variant="outline">
                <Link href={'/merchant/store-settings/products/create'}>
                  <IconPlus />
                  เพิ่มสินค้าใหม่
                </Link>
              </Button>
            )}
          </div>
        }
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewProducts ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลสินค้าของสาขาหรือร้านค้านี้"
        />
      ) : (
        <ProductsTable />
      )}
    </Sidebar>
  )
}
