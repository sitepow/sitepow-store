'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconPackage } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { ProductsTable } from './_components/ProductsTable'

export default function merchantStoreSettingsProductsPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader icon={IconPackage} title="รายการสินค้าทั้งหมด" />
      <ProductsTable />
    </DashboardSidebar>
  )
}
