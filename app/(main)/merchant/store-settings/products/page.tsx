'use client'

import { useState } from 'react'

import Link from 'next/link'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconPackage, IconPlus } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Button } from '@/components/ui/button'

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
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField
              value={selectedStoreId}
              onValueChange={setSelectedStoreId}
            />
            <Button asChild>
              <Link href={'/merchant/store-settings/products/create'}>
                เพิ่มสินค้าใหม่
                <IconPlus />
              </Link>
            </Button>
          </div>
        }
      />
      <ProductsTable storeId={selectedStoreId} />
    </DashboardSidebar>
  )
}
