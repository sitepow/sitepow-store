'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconBuildingStore } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { StoreCreateDialog } from './_components/StoreCreateDialog'
import { StoreTable } from './_components/StoreTable'

export default function MerchantStoreSettingsPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBuildingStore}
        title="จัดการร้านค้า"
        description="จัดการข้อมูลหน้าร้าน สลับเข้าสู่ระบบหลังบ้าน หรือเปิดร้านค้าใหม่เพื่อเริ่มธุรกิจเพิ่ม"
        endContent={<StoreCreateDialog />}
      />
      <StoreTable />
    </DashboardSidebar>
  )
}
