'use client'

import { useState } from 'react'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconPackage } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { ProductsTable } from './_components/ProductsTable'

export default function MerchantStoreSettingsProductsPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all')

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconPackage}
        title="รายการสินค้าทั้งหมด"
        description="จัดการข้อมูลสินค้า ตรวจสอบสถานะ และอัปเดตสต็อกสินค้าของร้านค้าคุณ"
        endContent={
          <StoreSelectField
            value={selectedStoreId}
            onValueChange={setSelectedStoreId}
          />
        }
      />
      <ProductsTable storeId={selectedStoreId} />
    </DashboardSidebar>
  )
}
