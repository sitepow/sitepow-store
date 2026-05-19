'use client'

import { useMemo, useState } from 'react'

import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { IconFilter, IconTicket } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { CouponListTable } from './_components/CouponListTable'
import { CreateCouponDialog } from './_components/CreateCouponDialog'

export type DiscountType = 'FIXED_AMOUNT' | 'PERCENTAGE'

export interface Coupon {
  id: string
  storeId: string
  code: string
  description: string | null
  discountType: DiscountType
  discountAmount: number
  minOrderAmount: number
  maxDiscount: number | null
  startDate: string
  endDate: string
  usageLimit: number | null
  usedCount: number
  branchId: string | null
}

export const MOCK_BRANCHES: Record<
  string,
  Array<{ id: string; name: string }>
> = {
  'store-1': [
    { id: 'br-1', name: 'สาขาสยามสแควร์' },
    { id: 'br-2', name: 'สาขาอารีย์' },
  ],
  'store-3': [{ id: 'br-3', name: 'สาขาเซ็นทรัลเวิลด์' }],
}

const MOCK_COUPONS: Coupon[] = [
  {
    id: 'cp-1',
    storeId: 'store-1',
    code: 'OPENING20',
    description: 'ส่วนลดฉลองเปิดร้านใหม่ ลด 20 บาท เมื่อไม่มีขั้นต่ำ',
    discountType: 'FIXED_AMOUNT',
    discountAmount: 20,
    minOrderAmount: 0,
    maxDiscount: null,
    startDate: '2026-05-01',
    endDate: '2026-06-01',
    usageLimit: 100,
    usedCount: 45,
    branchId: null,
  },
  {
    id: 'cp-2',
    storeId: 'store-1',
    code: 'SIAMONLY10',
    description: 'ส่วนลดพิเศษ 10% เฉพาะหน้าร้านสาขาสยามเท่านั้น',
    discountType: 'PERCENTAGE',
    discountAmount: 10,
    minOrderAmount: 300,
    maxDiscount: 100,
    startDate: '2026-05-10',
    endDate: '2026-05-31',
    usageLimit: 50,
    usedCount: 50,
    branchId: 'br-1',
  },
  {
    id: 'cp-3',
    storeId: 'store-3',
    code: 'ITGADGET50',
    description: 'ลดทันที 50 บาท สำหรับยอดซื้อ 1,000 บาทขึ้นไป',
    discountType: 'FIXED_AMOUNT',
    discountAmount: 50,
    minOrderAmount: 1000,
    maxDiscount: null,
    startDate: '2026-05-01',
    endDate: '2026-12-31',
    usageLimit: null,
    usedCount: 12,
    branchId: null,
  },
]

export default function MerchantMarketingCouponsPage() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-1')
  const [coupons, setCoupons] = useState<Coupon[]>(MOCK_COUPONS)

  const filteredCoupons = useMemo(() => {
    return coupons.filter((coupon) => coupon.storeId === selectedStoreId)
  }, [coupons, selectedStoreId])

  const currentStoreBranches = useMemo(() => {
    return MOCK_BRANCHES[selectedStoreId] || []
  }, [selectedStoreId])

  const handleCouponCreated = (newCoupon: Coupon) => {
    setCoupons((prev) => [...prev, newCoupon])
  }

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <PageTabHeader
        icon={IconTicket}
        title="คูปองส่วนลดและการตลาด"
        description="จัดการรหัสโปรโมชัน เงื่อนไขส่วนลดท้ายบิล เพื่อนำไปจัดแคมเปญส่งเสริมการขายบนหน้า Sale Page และระบบฝั่งหน้าร้าน POS"
        endContent={
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end">
            <Field className="w-fit">
              <FieldLabel className="flex items-center gap-1.5">
                <IconFilter size={14} />
                กรองตามร้านค้า
              </FieldLabel>
              <Select
                value={selectedStoreId}
                onValueChange={setSelectedStoreId}
              >
                <SelectTrigger className="w-full sm:w-60">
                  <SelectValue placeholder="เลือกแบรนด์ร้านค้า" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="store-1">
                    เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล
                  </SelectItem>
                  <SelectItem value="store-2">
                    ร้านกาแฟหอมกรุ่น Cafe &
                  </SelectItem>
                  <SelectItem value="store-3">
                    Gadget & IT Accessories
                  </SelectItem>
                </SelectContent>
              </Select>
            </Field>
            <CreateCouponDialog
              selectedStoreId={selectedStoreId}
              currentStoreBranches={currentStoreBranches}
              onCouponCreated={handleCouponCreated}
            />
          </div>
        }
      />
      <CouponListTable
        coupons={filteredCoupons}
        currentStoreBranches={currentStoreBranches}
      />
    </DashboardSidebar>
  )
}
