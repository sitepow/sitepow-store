'use client'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { IconPackage } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { OrderTable } from './_components/OrderTable'

export default function StoreUserOrderPage() {
  return (
    <DashboardSidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconPackage}
        title="การซื้อของฉัน"
        description="ติดตามสถานะคำสั่งซื้อ ตรวจสอบเลขพัสดุ และดูประวัติการช้อปปิ้งย้อนหลัง"
      />
      <OrderTable />
    </DashboardSidebar>
  )
}
