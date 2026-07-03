'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconPackages } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { InventoryTable } from './_components/InventoryTable'

export default function MerchantInventoryPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconPackages}
        title="จัดการคลังสินค้า"
        description="ตรวจสอบและอัปเดตจำนวนสต็อกสินค้าในแต่ละสาขา"
        endContent={<StoreSelectField />}
      />
      <InventoryTable />
    </DashboardSidebar>
  )
}
