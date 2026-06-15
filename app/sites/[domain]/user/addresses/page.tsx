'use client'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { IconMapPin } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { AddressTable } from './_components/AddressTable'

export default function StoreUserAddressesPage() {
  return (
    <DashboardSidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconMapPin}
        title="ที่อยู่จัดส่งของฉัน"
        description="บันทึกสมุดที่อยู่รับสินค้า เพื่อความสะดวกและรวดเร็วในการกรอกฟอร์มปลายทางตอนสั่งซื้อผ่านหน้า Sale Page"
      />
      <AddressTable />
    </DashboardSidebar>
  )
}
