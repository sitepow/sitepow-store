'use client'

import { useState } from 'react'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { Plan } from '@/generated/prisma/enums'
import { IconBuildingStore } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { StoreCreateForm } from './_components/StoreCreateForm'
import { StoreTable } from './_components/StoreTable'

const MOCK_STORES = [
  {
    id: '1',
    name: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    slug: 'korean-minimal-shop',
    plan: 'PRO' as Plan,
    status: 'ACTIVE',
    createdAt: '2026-01-15',
  },
  {
    id: '2',
    name: 'ร้านกาแฟหอมกรุ่น Cafe & Bakery',
    slug: 'homkrun-cafe',
    plan: 'STARTER' as Plan,
    status: 'MAINTENANCE',
    createdAt: '2026-03-10',
  },
]

export default function MerchantStoreSettingsPage() {
  const [stores] = useState(MOCK_STORES)

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconBuildingStore}
        title="ร้านค้าของคุณ"
        description="จัดการข้อมูลหน้าร้าน สลับเข้าสู่ระบบหลังบ้าน หรือเปิดร้านค้าใหม่เพื่อเริ่มธุรกิจเพิ่ม"
        endContent={<StoreCreateForm />}
      />
      <StoreTable stores={stores} />
    </DashboardSidebar>
  )
}
