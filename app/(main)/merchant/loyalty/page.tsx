'use client'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import { IconCoin, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { StoreSelectField } from '@/components/form/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

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
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
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
          icon={<IconLock />}
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
    </Sidebar>
  )
}
