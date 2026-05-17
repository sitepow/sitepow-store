'use client'

import { useState } from 'react'

import {
  IconAlertCircle,
  IconCheck,
  IconCopy,
  IconInfoCircle,
  IconTicket,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

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

export function VouchersContent() {
  const [vouchers, setVouchers] = useState(MOCK_VOUCHERS)
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
    <div className="space-y-6">
      <PageTabHeader
        icon={IconTicket}
        title="โค้ดส่วนลดของฉัน (My Vouchers)"
        description="คลังรวมคูปองและโค้ดส่วนลดที่คุณเก็บไว้
            สามารถคลิกคัดลอกไปใช้ลดราคาได้ทันทีก่อนชำระเงิน"
      />

      <Tabs
        defaultValue="available"
        onValueChange={setActiveSubTab}
        className="w-full"
      >
        <TabsList className="grid h-9 w-full max-w-75 grid-cols-2 text-xs">
          <TabsTrigger value="available" className="text-xs">
            ใช้งานได้ ({vouchers.filter((v) => v.status === 'AVAILABLE').length}
            )
          </TabsTrigger>
          <TabsTrigger value="used_expired" className="text-xs">
            ใช้แล้ว / หมดอายุ
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {filteredVouchers.length === 0 ? (
        <div className="text-muted-foreground rounded-2xl border border-dashed py-16 text-center text-xs">
          ไม่พบโค้ดส่วนลดในหมวดหมู่นี้
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {filteredVouchers.map((voucher) => {
            const isAvailable = voucher.status === 'AVAILABLE'

            return (
              <Card
                key={voucher.id}
                className={`flex overflow-hidden border-2 transition-colors ${
                  isAvailable
                    ? 'border-primary/20 bg-background hover:border-primary/40'
                    : 'border-muted bg-muted/10 opacity-70'
                }`}
              >
                <div
                  className={`relative flex w-24 shrink-0 flex-col items-center justify-center border-r border-dashed p-3 text-center ${
                    isAvailable
                      ? 'bg-primary/5 text-primary'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <div className="bg-background border-muted absolute -top-2 -right-2 h-4 w-4 rounded-full border" />
                  <div className="bg-background border-muted absolute -right-2 -bottom-2 h-4 w-4 rounded-full border" />

                  <IconTicket size={24} className="mb-1" />
                  <span className="text-lg leading-tight font-extrabold">
                    {voucher.discountType === 'FIXED'
                      ? `฿${voucher.discountValue}`
                      : `${voucher.discountValue}%`}
                  </span>
                  <span className="mt-0.5 block text-[9px] font-semibold tracking-wider uppercase">
                    DISCOUNT
                  </span>
                </div>

                <div className="flex grow flex-col justify-between space-y-3 p-4 text-xs">
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-foreground line-clamp-1 text-xs font-bold">
                        {voucher.title}
                      </span>
                      <Badge
                        variant="secondary"
                        className="max-w-30 truncate px-1.5 py-0 text-[9px]"
                      >
                        {voucher.storeName}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground line-clamp-2 text-[11px] leading-relaxed">
                      {voucher.description}
                    </p>
                  </div>

                  <div className="border-muted/60 flex items-center justify-between border-t pt-2 text-[11px]">
                    <span className="text-muted-foreground flex items-center gap-1 font-mono text-[10px]">
                      <IconAlertCircle size={12} /> หมดอายุ:{' '}
                      {voucher.expiryDate}
                    </span>

                    {isAvailable ? (
                      <Button
                        size="sm"
                        className={`h-7 gap-1 px-3 font-mono text-[11px] font-bold transition-all ${
                          copiedId === voucher.id
                            ? 'border-none bg-green-600 text-white hover:bg-green-600'
                            : ''
                        }`}
                        onClick={() => handleCopyCode(voucher.id, voucher.code)}
                      >
                        {copiedId === voucher.id ? (
                          <>
                            <IconCheck size={12} /> COPIED
                          </>
                        ) : (
                          <>
                            <IconCopy size={12} /> {voucher.code}
                          </>
                        )}
                      </Button>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-muted-foreground bg-muted/40 px-2 py-0.5 text-[10px] font-semibold"
                      >
                        {voucher.status === 'EXPIRED'
                          ? 'หมดอายุแล้ว'
                          : 'ใช้ไปแล้ว'}
                      </Badge>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      <div className="text-muted-foreground bg-muted/30 flex items-start gap-1.5 rounded-xl border p-3 text-[11px]">
        <IconInfoCircle size={14} className="text-primary mt-0.5 shrink-0" />
        <span>
          <strong>วิธีการใช้งาน:</strong> เลือกคัดลอกรหัสโค้ดส่วนลดที่คุณต้องการ
          จากนั้นนำไปกรอกในช่อง &quot;รหัสส่วนลด / Promo Code&quot; บนหน้า Sale
          Page
          หรือแจ้งกับพนักงานตอนชำระเงินที่หน้าร้านค้าเพื่อให้ระบบทำการคำนวณส่วนลดท้ายบิลครับ
        </span>
      </div>
    </div>
  )
}
