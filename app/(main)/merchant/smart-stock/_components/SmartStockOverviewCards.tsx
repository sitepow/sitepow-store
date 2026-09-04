'use client'

import React from 'react'

import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { MOCK_SMART_STOCK_STATS } from '@/constants/smart-stock'
import { formatNumber } from '@/utils/pricing'
import { Boxes, CheckCircle2, RefreshCw, Store } from 'lucide-react'

export function SmartStockOverviewCards() {
  const stats = MOCK_SMART_STOCK_STATS

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatsCard
        title="สต็อกรวมทุกช่องทาง"
        value={`${formatNumber(stats.totalStockUnits)} ชิ้น`}
        description={`ครอบคลุมทั้งหมด ${stats.totalSkus} รายการสินค้า`}
        icon={Boxes}
      />
      <StatsCard
        title="คลังหลักหน้าร้าน (HQ)"
        value={`${formatNumber(stats.channels.local.totalUnits)} ชิ้น`}
        description="สต็อกตั้งต้นสำหรับตัดขาย POS & หน้าเว็บ"
        icon={Store}
      />
      <StatsCard
        title="ช่องทางที่เชื่อมต่อ"
        value="3 แพลตฟอร์ม"
        description="Shopee, Lazada, Facebook Marketplace"
        icon={RefreshCw}
      />
      <StatsCard
        title="ความถูกต้องของสต็อก"
        value={`${stats.syncedPercentage}%`}
        description={`ตรงกัน 5 รายการ, ต้องตรวจสอบ ${stats.mismatchCount} รายการ`}
        icon={CheckCircle2}
      />
    </div>
  )
}
