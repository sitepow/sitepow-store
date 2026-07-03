'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { Receipt } from 'lucide-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { MerchantInvoiceTable } from './_components/MerchantInvoiceTable'
import { MerchantSubscriptionTable } from './_components/MerchantSubscriptionTable'

export default function MerchantBillingSubscriptionPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={Receipt}
        title="การจัดการสมาชิกและค่าบริการ"
        description="ตรวจสอบข้อมูลแพลนรายเดือนและประวัติใบเสร็จแยกตามรายร้านค้าของคุณ"
        endContent={<StoreSelectField />}
      />
      <MerchantSubscriptionTable />
      <MerchantInvoiceTable />
    </DashboardSidebar>
  )
}
