'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconWallet } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { TransactionTable } from './_components/TransactionTable'

export default function TransactionPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconWallet}
        title="รายการเงิน"
        description="ประวัติการเงินทั้งหมดของร้านค้า"
        endContent={<StoreSelectField />}
      />
      <TransactionTable />
    </DashboardSidebar>
  )
}
