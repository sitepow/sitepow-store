'use client'

import { useState } from 'react'

import { BUYER_NAVIGATION } from '@/constants/navigation'
import { IconInfoCircle, IconTicket } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { VouchersTable } from './_components/VouchersTable'

const MOCK_VOUCHERS = [
  {
    id: 'v-001',
    code: 'WELCOME100',
    title: 'ส่วนลดลูกค้าใหม่ ลด 100.-',
    description: 'ลดเพิ่ม 100 บาท เมื่อซื้อขั้นต่ำ 500 บาทขึ้นไป',
    discountType: 'FIXED',
    discountValue: 100,
    minSpend: 500,
    expiryDate: '2026-06-30',
    storeName: 'sitepow-store (ทุกร้านค้า)',
    status: 'AVAILABLE',
  },
  {
    id: 'v-002',
    code: 'MINIMAL15',
    title: 'คูปองแฟชั่นมินิมอล ลด 15%',
    description: 'ลดราคา 15% สูงสุดไม่เกิน 150 บาท ไม่มีขั้นต่ำ',
    discountType: 'PERCENT',
    discountValue: 15,
    minSpend: 0,
    expiryDate: '2026-05-31',
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    status: 'AVAILABLE',
  },
  {
    id: 'v-003',
    code: 'THANKYOU50',
    title: 'โค้ดขอบคุณจากแบรนด์ ลด 50.-',
    description: 'ส่วนลดแทนคำขอบคุณ ลดเพิ่ม 50 บาท ไม่มีขั้นต่ำ',
    discountType: 'FIXED',
    discountValue: 50,
    minSpend: 0,
    expiryDate: '2026-05-10',
    storeName: 'Gadget & IT Accessories',
    status: 'EXPIRED',
  },
]

export default function StoreUserVouchersPage() {
  const [vouchers] = useState(MOCK_VOUCHERS)
  const [activeSubTab, setActiveSubTab] = useState('available')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const filteredVouchers = vouchers.filter((v) => {
    if (activeSubTab === 'available') return v.status === 'AVAILABLE'
    if (activeSubTab === 'used_expired')
      return v.status === 'USED' || v.status === 'EXPIRED'
    return true
  })

  return (
    <DashboardSidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <PageTabHeader
        icon={IconTicket}
        title="โค้ดส่วนลดของฉัน"
        description="คลังรวมคูปองและโค้ดส่วนลดที่คุณเก็บไว้ สามารถคลิกคัดลอกไปใช้ลดราคาได้ทันทีก่อนชำระเงิน"
      />
      <div className="space-y-5">
        <Tabs
          defaultValue="available"
          onValueChange={setActiveSubTab}
          className="w-full"
        >
          <TabsList className="grid w-full max-w-72 grid-cols-2">
            <TabsTrigger value="available">
              ใช้งานได้ (
              {vouchers.filter((v) => v.status === 'AVAILABLE').length})
            </TabsTrigger>
            <TabsTrigger value="used_expired">ใช้แล้ว / หมดอายุ</TabsTrigger>
          </TabsList>
        </Tabs>
        {filteredVouchers.length === 0 ? (
          <div className="text-muted-foreground bg-background rounded-md border border-dashed py-16 text-center text-xs">
            ไม่พบโค้ดส่วนลดในหมวดหมู่นี้
          </div>
        ) : (
          <VouchersTable
            vouchers={filteredVouchers}
            copiedId={copiedId}
            onCopyCode={handleCopyCode}
          />
        )}
        <Alert className="bg-muted/40">
          <IconInfoCircle />
          <AlertTitle className="text-foreground text-xs font-bold">
            วิธีการใช้งาน
          </AlertTitle>
          <AlertDescription className="text-muted-foreground text-[11px] leading-relaxed">
            เลือกคัดลอกรหัสโค้ดส่วนลดที่คุณต้องการ จากนั้นนำไปกรอกในช่อง
            &quot;รหัสส่วนลด / Promo Code&quot; บนหน้า Sale Page
            หรือแจ้งกับพนักงานตอนชำระเงินที่หน้าร้านค้าเพื่อให้ระบบทำการคำนวณส่วนลดท้ายบิลครับ
          </AlertDescription>
        </Alert>
      </div>
    </DashboardSidebar>
  )
}
