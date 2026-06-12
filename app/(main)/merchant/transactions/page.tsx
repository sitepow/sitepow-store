'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconWallet } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { StoreBalanceCard } from './_components/StoreBalanceCard'
import { TransactionTable } from './_components/TransactionTable'

export default function TransactionPage() {
  const { selectedStoreId } = useStoreFilter()

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconWallet}
        title="รายการเงิน"
        description="ประวัติการเงินทั้งหมดของร้านค้า"
        endContent={<StoreSelectField />}
      />
      {selectedStoreId !== ALL_STORES && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <StoreBalanceCard />
          <div className="xl:col-span-2">
            <TransactionTable />
          </div>
        </div>
      )}

      {selectedStoreId === ALL_STORES && <ActionRequiredAlert />}
    </DashboardSidebar>
  )
}
