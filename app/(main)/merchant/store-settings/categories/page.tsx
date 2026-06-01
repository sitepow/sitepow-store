'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconCategory } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { CategoriesTable } from './_components/CategoriesTable'
import { CategoryCreateDialog } from './_components/CategoryCreateDialog'

export default function MerchantStoreSettingsCategoriesPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconCategory}
        title="รายการหมวดหมู่ทั้งหมด"
        description="จัดการหมวดหมู่สินค้า เพื่อจัดระเบียบสินค้าในร้านค้าของคุณ"
        endContent={
          <div className="flex flex-wrap items-end gap-5">
            <StoreSelectField />
            <CategoryCreateDialog />
          </div>
        }
      />
      <CategoriesTable />
    </DashboardSidebar>
  )
}
