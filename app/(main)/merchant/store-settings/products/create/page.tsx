'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconPlus } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { CreateProductForm } from './_components/CreateProductForm'

export default function StoreAdminProductNew() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader icon={IconPlus} title="เพิ่มสินค้าใหม่" />
      <CreateProductForm />
    </DashboardSidebar>
  )
}
