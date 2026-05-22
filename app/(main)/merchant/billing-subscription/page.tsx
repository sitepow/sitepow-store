'use client'

import { useState } from 'react'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { Plan, SubStatus } from '@/generated/prisma/enums'
import { Receipt } from 'lucide-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'

import { MerchantInvoiceTable } from './_components/MerchantInvoiceTable'
import { MerchantSubscriptionTable } from './_components/MerchantSubscriptionTable'

const MOCK_USER_STORES = [
  {
    id: 'store-1',
    name: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    plan: 'PRO' as Plan,
    status: 'ACTIVE' as SubStatus,
    isTrial: true,
    daysRemaining: 8,
    totalDays: 14,
    nextBilling: '15 เม.ย. 2026',
  },
  {
    id: 'store-2',
    name: 'ร้านกาแฟหอมกรุ่น Cafe & Bakery',
    plan: 'STARTER' as Plan,
    status: 'ACTIVE' as SubStatus,
    isTrial: false,
    daysRemaining: 0,
    totalDays: 0,
    nextBilling: 'ฟรีตลอดชีพ',
  },
  {
    id: 'store-3',
    name: 'Gadget & IT Accessories',
    plan: 'ULTIMATE' as Plan,
    status: 'PAST_DUE' as SubStatus,
    isTrial: false,
    daysRemaining: 3,
    totalDays: 7,
    nextBilling: '02 พ.ค. 2026 (ค้างชำระ)',
  },
]

const MOCK_INVOICES = [
  {
    id: 'INV-2026-003',
    date: '2026-03-15',
    amount: 490,
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    plan: 'Pro Plan',
    status: 'PAID',
  },
  {
    id: 'INV-2026-002',
    date: '2026-03-02',
    amount: 1290,
    storeName: 'Gadget & IT Accessories',
    plan: 'Ultimate Plan',
    status: 'PAID',
  },
  {
    id: 'INV-2026-001',
    date: '2026-02-15',
    amount: 490,
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    plan: 'Pro Plan',
    status: 'PAID',
  },
]

export default function MerchantBillingSubscriptionPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all')

  const filteredStores =
    selectedStoreId === 'all'
      ? MOCK_USER_STORES
      : MOCK_USER_STORES.filter((s) => s.id === selectedStoreId)

  const filteredInvoices =
    selectedStoreId === 'all'
      ? MOCK_INVOICES
      : MOCK_INVOICES.filter(
          (inv) =>
            inv.storeName ===
            MOCK_USER_STORES.find((s) => s.id === selectedStoreId)?.name,
        )

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={Receipt}
        title="การจัดการสมาชิกและค่าบริการ"
        description="ตรวจสอบข้อมูลแพลนรายเดือนและประวัติใบเสร็จแยกตามรายร้านค้าของคุณ"
        endContent={
          <StoreSelectField
            value={selectedStoreId}
            onValueChange={setSelectedStoreId}
          />
        }
      />
      <MerchantSubscriptionTable stores={filteredStores} />
      <MerchantInvoiceTable invoices={filteredInvoices} />
    </DashboardSidebar>
  )
}
