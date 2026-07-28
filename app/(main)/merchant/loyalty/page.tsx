'use client'

import { useEmployeePermission } from '@/actions/hooks/employee'
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
  const {
    canViewStoreSettings,
    canViewCustomers,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconCoin}
        title="ระบบแต้มสะสม"
        description="ตั้งค่าเงื่อนไขการแจกแต้ม และบริหารจัดการคะแนนสมาชิกของแต่ละร้านค้า"
        endContent={<StoreSelectField />}
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewCustomers ? (
        <ActionRequiredAlert
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลระบบแต้มสะสมและสมาชิกของสาขาหรือร้านค้านี้"
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-12">
          {canViewStoreSettings && (
            <LoyaltySettingsCard className="xl:col-span-4" />
          )}
          <CustomerPointsTable
            className={
              canViewStoreSettings ? 'xl:col-span-8' : 'xl:col-span-12'
            }
          />
        </div>
      )}
    </DashboardSidebar>
  )
}
