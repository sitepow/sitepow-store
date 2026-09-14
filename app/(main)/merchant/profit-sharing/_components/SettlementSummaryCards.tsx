'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { StatsCard } from '@/components/StatsCard'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import {
  IconArrowUpRight,
  IconCoins,
  IconReceipt,
  IconScale,
  IconShoppingCart,
  IconWallet,
} from '@tabler/icons-react'

interface SettlementSummaryCardsProps {
  revenue: number
  cogs: number
  expense: number
  netProfit: number
  totalAllocated: number
  retainedEarnings: number
}

export function SettlementSummaryCards({
  revenue,
  cogs,
  expense,
  netProfit,
  totalAllocated,
  retainedEarnings,
}: SettlementSummaryCardsProps) {
  const t = useTranslations('merchant.profitSharing.metrics')
  const { format } = useMerchantCurrency()

  const totalCostAndExpense = cogs + expense
  const allocatedPercent =
    netProfit > 0
      ? Math.min(100, Math.round((totalAllocated / netProfit) * 100))
      : 0

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Gross Revenue */}
      <StatsCard
        title={t('revenue')}
        value={format(revenue)}
        description="ยอดขายสุทธิที่ชำระเงินแล้วในรอบเดือนนี้"
        icon={IconShoppingCart}
      />

      {/* COGS & Expenses */}
      <StatsCard
        title={t('cogsAndExpense')}
        value={format(totalCostAndExpense)}
        description={`ต้นทุน ${format(cogs)} • ค่าใช้จ่าย ${format(expense)}`}
        icon={IconReceipt}
      />

      {/* Net Profit */}
      <StatsCard
        title={t('netProfit')}
        value={format(netProfit)}
        description="รายรับรวม - ต้นทุนสินค้า - ค่าใช้จ่ายร้าน"
        icon={IconWallet}
      />

      {/* Allocated vs Retained */}
      <StatsCard
        title={t('totalAllocated')}
        value={format(totalAllocated)}
        description={`เงินสำรองร้านค้าคงเหลือ: ${format(retainedEarnings)} (${100 - allocatedPercent}%)`}
        badge={`จัดสรรแล้ว ${allocatedPercent}%`}
        icon={IconCoins}
      />
    </div>
  )
}
