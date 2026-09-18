'use client'

import { useTranslations } from 'next-intl'

import { formatNumber } from '@/utils/pricing'
import {
  IconArrowUpRight,
  IconReceipt,
  IconShoppingCart,
  IconWallet,
} from '@tabler/icons-react'

import { StatsCard } from '@/components/StatsCard'

interface AnalyticsOverviewStatsProps {
  totalRevenue: number
  totalNetProfit: number
  totalOrders: number
  averageOrderValue: number
  formatCurrency: (amount: number) => string
}

export function AnalyticsOverviewStats({
  totalRevenue,
  totalNetProfit,
  totalOrders,
  averageOrderValue,
  formatCurrency,
}: AnalyticsOverviewStatsProps) {
  const t = useTranslations('merchant.analytics')

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <StatsCard
        title={t('overviewStats.totalRevenue')}
        value={formatCurrency(totalRevenue)}
        description={t('overviewStats.totalRevenueDesc')}
        icon={IconWallet}
      />
      <StatsCard
        title={t('overviewStats.netProfit')}
        value={formatCurrency(totalNetProfit)}
        description={t('overviewStats.netProfitDesc')}
        icon={IconArrowUpRight}
      />
      <StatsCard
        title={t('overviewStats.totalOrders')}
        value={t('overviewStats.ordersUnit', {
          count: formatNumber(totalOrders),
        })}
        description={t('overviewStats.totalOrdersDesc')}
        icon={IconShoppingCart}
      />
      <StatsCard
        title={t('overviewStats.aov')}
        value={formatCurrency(averageOrderValue)}
        description={t('overviewStats.aovDesc')}
        icon={IconReceipt}
      />
    </div>
  )
}
