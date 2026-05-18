'use client'

import { useState } from 'react'

import { MerchantLayout } from '@/app/sites/[domain]/_components/layout/admin/MerchantLayout'
import { IconFilter, IconSparkles } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { AiUsageLog, AiUsageLogTable } from './_components/AiUsageLogTable'
import {
  StoreAiCredit,
  StoreAiCreditTable,
} from './_components/StoreAiCreditTable'

const MOCK_STORE_AI_CREDITS: StoreAiCredit[] = [
  {
    id: 'store-1',
    name: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    plan: 'Pro Plan',
    visionCredits: { used: 320, total: 500 },
    searchCredits: { used: 150, total: 200 },
    resetDate: '15 พ.ค. 2026',
  },
  {
    id: 'store-2',
    name: 'ร้านกาแฟหอมกรุ่น Cafe & Bakery',
    plan: 'Starter Plan',
    visionCredits: { used: 0, total: 0 },
    searchCredits: { used: 0, total: 0 },
    resetDate: '-',
  },
  {
    id: 'store-3',
    name: 'Gadget & IT Accessories',
    plan: 'Ultimate Plan',
    visionCredits: { used: 1420, total: 5000 },
    searchCredits: { used: 2100, total: 3000 },
    resetDate: '02 มิ.ย. 2026',
  },
]

const MOCK_AI_LOGS: AiUsageLog[] = [
  {
    id: 'log-1',
    storeId: 'store-1',
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    feature: 'AI Slip Verification',
    description: 'ตรวจสอบสลิปออเดอร์ #ORD-9942',
    status: 'SUCCESS',
    creditsUsed: 1,
    timestamp: '2026-05-17 10:14',
  },
  {
    id: 'log-2',
    storeId: 'store-3',
    storeName: 'Gadget & IT Accessories',
    feature: 'AI Visual Search',
    description: 'พนักงานสาขา 1 สแกนหาเคสไอโฟนด้วยรูปภาพ',
    status: 'SUCCESS',
    creditsUsed: 1,
    timestamp: '2026-05-17 09:45',
  },
  {
    id: 'log-3',
    storeId: 'store-1',
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    feature: 'AI Slip Verification',
    description: 'ตรวจสอบสลิปผิดพลาด (ภาพไม่ชัดเจน)',
    status: 'FAILED',
    creditsUsed: 0,
    timestamp: '2026-05-16 18:22',
  },
  {
    id: 'log-4',
    storeId: 'store-3',
    storeName: 'Gadget & IT Accessories',
    feature: 'AI Visual Search',
    description: 'พนักงานสาขา 2 สแกนหาพาวเวอร์แบงค์',
    status: 'SUCCESS',
    creditsUsed: 1,
    timestamp: '2026-05-16 15:30',
  },
]

export default function MerchantAiUsagePage() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all')

  const filteredStores =
    selectedStoreId === 'all'
      ? MOCK_STORE_AI_CREDITS
      : MOCK_STORE_AI_CREDITS.filter((s) => s.id === selectedStoreId)

  const filteredLogs =
    selectedStoreId === 'all'
      ? MOCK_AI_LOGS
      : MOCK_AI_LOGS.filter((log) => log.storeId === selectedStoreId)

  return (
    <MerchantLayout>
      <PageTabHeader
        icon={IconSparkles}
        title="เครดิตและการใช้งาน AI"
        description="ตรวจสอบปริมาณการทำงานของระบบ AI Vision คัดกรองสลิป และ AI Search ค้นหาสินค้าจากคลังรูปภาพ"
        endContent={
          <Field>
            <FieldLabel>
              <IconFilter size={14} />
              กรองตามร้านค้า
            </FieldLabel>
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="เลือกดูทุกร้านค้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  ร้านค้าทั้งหมด ({MOCK_STORE_AI_CREDITS.length})
                </SelectItem>
                {MOCK_STORE_AI_CREDITS.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        }
      />
      <StoreAiCreditTable stores={filteredStores} />
      <AiUsageLogTable logs={filteredLogs} />
    </MerchantLayout>
  )
}
