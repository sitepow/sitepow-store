'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconShoppingCart } from '@tabler/icons-react'

import { BranchSelectField } from '@/components/BranchSelectField'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { OrderTable } from './_components/OrderTable'

export default function OrderPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconShoppingCart}
        title="จัดการออเดอร์"
        description="ติดตามและจัดการออเดอร์ทั้งหมดของร้านค้า"
        endContent={
          <div className="flex flex-wrap gap-2">
            <StoreSelectField />
            <BranchSelectField />
          </div>
        }
      />
      <OrderTable />
    </DashboardSidebar>
  )
}
