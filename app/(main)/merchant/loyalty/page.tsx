'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconCoin } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { CustomerPointsTable } from './_components/CustomerPointsTable'
import { LoyaltySettingsCard } from './_components/LoyaltySettingsCard'

export default function MerchantLoyaltyPage() {
  const { selectedStoreId } = useStoreFilter()

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconCoin}
        title="ระบบแต้มสะสม"
        description="ตั้งค่าเงื่อนไขการแจกแต้ม และบริหารจัดการคะแนนสมาชิกของแต่ละร้านค้า"
        endContent={<StoreSelectField />}
      />
      {selectedStoreId === ALL_STORES && <ActionRequiredAlert />}
      {selectedStoreId !== ALL_STORES && (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-12">
          <LoyaltySettingsCard className="xl:col-span-4" />
          <CustomerPointsTable className="xl:col-span-8" />
        </div>
      )}
    </DashboardSidebar>
  )
}
