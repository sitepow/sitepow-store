'use client'

import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { IconCreditCard, IconFileInvoice, IconLock } from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { PageTabHeader } from '@/components/layout/PageTabHeader'
import { StoreSelectField } from '@/components/form/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'

import { MerchantInvoiceTable } from './_components/MerchantInvoiceTable'
import { MerchantSubscriptionTable } from './_components/MerchantSubscriptionTable'

export default function MerchantBillingSubscriptionPage() {
  const { selectedStoreId } = useStoreFilter()
  const { canViewSubscription, isLoading: isPermissionLoading } =
    useEmployeePermission()

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
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
        <MerchantSubscriptionTable />
      )}
      <PageTabHeader
        icon={IconFileInvoice}
        title="ใบแจ้งหนี้และบิล"
        description="ตรวจสอบประวัติการชำระเงิน ดาวน์โหลดใบแจ้งหนี้ และใบเสร็จรับเงิน"
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
        <MerchantInvoiceTable />
      )}
    </Sidebar>
  )
}
