'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconWallet } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { CreditHistoryTable } from './_components/CreditHistoryTable'
import { StoreCreditCard } from './_components/StoreCreditCard'

export default function CreditPage() {
  const { selectedStoreId } = useStoreFilter()

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconWallet}
        title="จัดการเครดิต"
        description="ตรวจสอบยอดเครดิตคงเหลือและประวัติการใช้บริการ AI และตรวจสลิปของคุณ"
        endContent={<StoreSelectField />}
      />
      {selectedStoreId !== ALL_STORES && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
          <StoreCreditCard />
          <div className="xl:col-span-2">
            <CreditHistoryTable />
          </div>
        </div>
      )}
      {selectedStoreId === ALL_STORES && <ActionRequiredAlert />}
    </DashboardSidebar>
  )
}
