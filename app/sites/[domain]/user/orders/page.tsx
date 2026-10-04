'use client'

import { BUYER_NAVIGATION } from '@/constants/store/navigation'
import { IconPackage } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Sidebar } from '@/components/layout/Sidebar'

import { OrderTable } from './_components/OrderTable'

export default function StoreUserOrderPage() {
  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconPackage}
        title="การซื้อของฉัน"
        description="ติดตามสถานะคำสั่งซื้อ ตรวจสอบเลขพัสดุ และดูประวัติการช้อปปิ้งย้อนหลัง"
      />
      <OrderTable />
    </Sidebar>
  )
}
