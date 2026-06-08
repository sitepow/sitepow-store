'use client'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconHeadset } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { ContactTicketTable } from './_components/ContactTicketTable'

export default function SupportPage() {
  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconHeadset}
        title="ติดต่อลูกค้า"
        description="จัดการ Ticket และติดตามการสื่อสารกับลูกค้า"
        endContent={<StoreSelectField />}
      />
      <ContactTicketTable />
    </DashboardSidebar>
  )
}
