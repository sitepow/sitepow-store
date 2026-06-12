'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconSparkles } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { AiUsageLogTable } from './_components/AiUsageLogTable'
import { StoreAiCreditTable } from './_components/StoreAiCreditTable'

export default function MerchantAiUsagePage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconSparkles}
        title="เครดิตและการใช้งาน AI"
        description="ตรวจสอบปริมาณการทำงานของระบบ AI Vision คัดกรองสลิป และ AI Search ค้นหาสินค้าจากคลังรูปภาพ"
        endContent={<StoreSelectField />}
      />
      <StoreAiCreditTable />
      <AiUsageLogTable />
    </DashboardSidebar>
  )
}
