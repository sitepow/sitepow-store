'use client'

import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { formatNumber } from '@/utils/pricing'
import { IconArrowUpRight, IconUserCheck, IconUsers } from '@tabler/icons-react'

import { AnalyticsCardShell } from './_components/AnalyticsCardShell'

interface CustomerRetentionCardProps {
  retention?: {
    totalUniqueCustomers: number
    newCustomersCount: number
    returningCustomersCount: number
    repeatPurchaseRate: number
  }
}

export function CustomerRetentionCard({
  retention,
}: CustomerRetentionCardProps) {
  return (
    <div className="flex flex-col gap-5">
      <AnalyticsCardShell
        title="การวิเคราะห์กลุ่มลูกค้า (Customer Retention)"
        description="อัตราการซื้อซ้ำและพฤติกรรมระหว่างลูกค้าใหม่กับลูกค้าเดิม"
        className="lg:col-span-2"
      />
      <div className="grid grid-cols-2 gap-4">
        <StatsCard
          title="ลูกค้าทั้งหมด"
          value={`${formatNumber(retention?.totalUniqueCustomers ?? 0)} ราย`}
          description="จำนวนลูกค้าที่ไม่ซ้ำกัน"
          icon={IconUsers}
        />
        <StatsCard
          title="ลูกค้าใหม่"
          value={`${formatNumber(retention?.newCustomersCount ?? 0)} ราย`}
          description="ซื้อครั้งแรกในช่วงนี้"
          icon={IconUserCheck}
        />
        <StatsCard
          title="ลูกค้าเก่าซื้อซ้ำ"
          value={`${formatNumber(retention?.returningCustomersCount ?? 0)} ราย`}
          description="มีการสั่งซื้อมากกว่า 1 ครั้ง"
          icon={IconUserCheck}
        />
        <StatsCard
          title="Repeat Purchase Rate"
          value={`${retention?.repeatPurchaseRate ?? 0}%`}
          description="อัตราส่วนการกลับมาซื้อซ้ำ"
          icon={IconArrowUpRight}
        />
      </div>
    </div>
  )
}
