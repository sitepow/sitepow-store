'use client'

import Link from 'next/link'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconBox, IconPlus } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Button } from '@/components/ui/button'

import { ProductsTable } from './_components/ProductsTable'

export default function MerchantStoreSettingsProductsPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBox}
        title="สินค้าทั้งหมด"
        description="จัดการข้อมูลสินค้า ตรวจสอบสถานะ และอัปเดตสต็อกสินค้าของร้านค้าคุณ"
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            <Button asChild variant="outline">
              <Link href={'/merchant/store-settings/products/create'}>
                <IconPlus />
                เพิ่มสินค้าใหม่
              </Link>
            </Button>
          </div>
        }
      />
      <ProductsTable />
    </DashboardSidebar>
  )
}
