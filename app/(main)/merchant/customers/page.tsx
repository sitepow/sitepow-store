'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconUsers } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { CustomerTable } from './_components/CustomerTable'

export default function CustomerPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconUsers}
        title="ลูกค้า"
        description="รายชื่อลูกค้าทั้งหมดของร้านค้า"
        endContent={<StoreSelectField />}
      />
      <CustomerTable />
    </DashboardSidebar>
  )
}
