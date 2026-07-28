'use client'

import { useEmployeePermission } from '@/actions/hooks/employee'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconCreditCard, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { MerchantInvoiceTable } from './_components/MerchantInvoiceTable'
import { MerchantSubscriptionTable } from './_components/MerchantSubscriptionTable'

export default function MerchantBillingSubscriptionPage() {
  const { selectedStoreId } = useStoreFilter()
  const { canViewSubscription, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconCreditCard}
        title="การสมัครสมาชิก"
        description="ตรวจสอบข้อมูลแพลนรายเดือนและประวัติใบเสร็จแยกตามรายร้านค้าของคุณ"
        endContent={<StoreSelectField />}
      />
      {selectedStoreId === ALL_STORES ? (
        <ActionRequiredAlert />
      ) : !isPermissionLoading && !canViewSubscription ? (
        <ActionRequiredAlert
          icon={<IconLock />}
          title="ไม่มีสิทธิ์เข้าถึง"
          description="คุณไม่มีสิทธิ์ในการดูข้อมูลการสมัครสมาชิกและใบแจ้งหนี้ของสาขาหรือร้านค้านี้"
        />
      ) : (
        <>
          <MerchantSubscriptionTable />
          <MerchantInvoiceTable />
        </>
      )}
    </DashboardSidebar>
  )
}
