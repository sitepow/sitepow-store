'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import {
  IconArrowUpRight,
  IconCoins,
  IconReceipt,
  IconScale,
  IconShoppingCart,
  IconWallet,
} from '@tabler/icons-react'

import { StatsCard } from '@/components/StatsCard'

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
        description={t('revenueDesc')}
        icon={IconShoppingCart}
      />

      {/* COGS & Expenses */}
      <StatsCard
        title={t('cogsAndExpense')}
        value={format(totalCostAndExpense)}
        description={t('cogsAndExpenseDesc', {
          cogs: format(cogs),
          expense: format(expense),
        })}
        icon={IconReceipt}
      />

      {/* Net Profit */}
      <StatsCard
        title={t('netProfit')}
        value={format(netProfit)}
        description={t('netProfitDesc')}
        icon={IconWallet}
      />

      {/* Allocated vs Retained */}
      <StatsCard
        title={t('totalAllocated')}
        value={format(totalAllocated)}
        description={t('retainedEarningsDesc', {
          retained: format(retainedEarnings),
          percent: 100 - allocatedPercent,
        })}
        badge={t('allocatedPercent', { percent: allocatedPercent })}
        icon={IconCoins}
      />
    </div>
  )
}
