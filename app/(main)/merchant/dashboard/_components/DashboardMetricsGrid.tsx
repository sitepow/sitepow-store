'use client'

import { useTranslations } from 'next-intl'

import { formatNumber } from '@/utils/pricing'
import {
  IconBuildingStore,
  IconCurrencyDollar,
  IconPackage,
  IconReceipt,
  IconReceiptOff,
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react'

import { StatsCard } from '@/components/StatsCard'

interface DashboardStatsData {
  dailySales: number
  dailySalesYesterday: number
  totalRevenue: number
  totalRevenueLastMonth: number
  totalOrders: number
  totalOrdersLastMonth: number
  newCustomers: number
  newCustomersLastMonth: number
  dailyGrossProfit: number
  dailyGrossMargin: number
  monthlyCOGS: number
  monthlyGrossProfit: number
  monthlyGrossProfitLastMonth: number
  dailyExpense: number
  monthlyExpense: number
  monthlyExpenseLastMonth: number
  yearlyExpense: number
  yearlyExpenseLastYear: number
  dailyNetProfit: number
  monthlyNetProfit: number
  monthlyNetMargin: number
  monthlyNetProfitLastMonth: number
  yearlyNetProfit: number
  yearlyNetMargin: number
}

interface DashboardMetricsGridProps {
  stats: DashboardStatsData
  formatCurrency: (amount: number) => string
}

function calculatePercentageChange(
  current: number,
  previous: number,
  periodLabel: string,
): string {
  if (previous === 0 && current === 0) {
    return `0% ${periodLabel}`
  }
  if (previous === 0) {
    return `+100% ${periodLabel}`
  }
  const pct = ((current - previous) / Math.abs(previous)) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% ${periodLabel}`
}

export function DashboardMetricsGrid({
  stats,
  formatCurrency,
}: DashboardMetricsGridProps) {
  const t = useTranslations('merchant.dashboard')

  const primaryStats = [
    {
      title: t('stats.dailySales'),
      value: formatCurrency(stats.dailySales),
      description: calculatePercentageChange(
        stats.dailySales,
        stats.dailySalesYesterday,
        t('period.fromYesterday'),
      ),
      icon: IconBuildingStore,
    },
    {
      title: t('stats.totalRevenue'),
      value: formatCurrency(stats.totalRevenue),
      description: calculatePercentageChange(
        stats.totalRevenue,
        stats.totalRevenueLastMonth,
        t('period.fromLastMonth'),
      ),
      icon: IconCurrencyDollar,
    },
    {
      title: t('stats.totalOrders'),
      value: formatNumber(stats.totalOrders),
      description: calculatePercentageChange(
        stats.totalOrders,
        stats.totalOrdersLastMonth,
        t('period.fromLastMonth'),
      ),
      icon: IconPackage,
    },
    {
      title: t('stats.newCustomers'),
      value: formatNumber(stats.newCustomers),
      description: calculatePercentageChange(
        stats.newCustomers,
        stats.newCustomersLastMonth,
        t('period.fromLastMonth'),
      ),
      icon: IconUsers,
    },
  ]

  const grossStats = [
    {
      title: t('stats.dailyGrossProfit'),
      value: formatCurrency(stats.dailyGrossProfit),
      description: `Gross Margin ${stats.dailyGrossMargin}%`,
      icon: stats.dailyGrossProfit >= 0 ? IconTrendingUp : IconTrendingDown,
    },
    {
      title: t('stats.monthlyCOGS'),
      value: formatCurrency(stats.monthlyCOGS),
      description: t('stats.monthlyCOGSDesc'),
      icon: IconReceiptOff,
    },
    {
      title: t('stats.monthlyGrossProfit'),
      value: formatCurrency(stats.monthlyGrossProfit),
      description: `Gross Margin ${stats.monthlyGrossProfit}% (${calculatePercentageChange(
        stats.monthlyGrossProfit,
        stats.monthlyGrossProfitLastMonth,
        t('period.fromLastMonth'),
      )})`,
      icon: IconTrendingUp,
    },
    {
      title: t('stats.monthlyGrossProfitLastMonth'),
      value: formatCurrency(stats.monthlyGrossProfitLastMonth),
      description: t('stats.monthlyGrossProfitLastMonthDesc'),
      icon: IconTrendingUp,
    },
  ]

  const expenseStats = [
    {
      title: t('stats.dailyExpense'),
      value: formatCurrency(stats.dailyExpense),
      description: t('stats.dailyExpenseDesc'),
      icon: IconReceipt,
    },
    {
      title: t('stats.monthlyExpense'),
      value: formatCurrency(stats.monthlyExpense),
      description: calculatePercentageChange(
        stats.monthlyExpense,
        stats.monthlyExpenseLastMonth,
        t('period.fromLastMonth'),
      ),
      icon: IconReceipt,
    },
    {
      title: t('stats.monthlyExpenseLastMonth'),
      value: formatCurrency(stats.monthlyExpenseLastMonth),
      description: t('stats.monthlyExpenseLastMonthDesc'),
      icon: IconReceipt,
    },
    {
      title: t('stats.yearlyExpense'),
      value: formatCurrency(stats.yearlyExpense),
      description: calculatePercentageChange(
        stats.yearlyExpense,
        stats.yearlyExpenseLastYear,
        t('period.fromLastYear'),
      ),
      icon: IconReceipt,
    },
  ]

  const netProfitStats = [
    {
      title: t('stats.dailyNetProfit'),
      value: formatCurrency(stats.dailyNetProfit),
      description: t('stats.dailyNetProfitDesc'),
      icon: stats.dailyNetProfit >= 0 ? IconTrendingUp : IconTrendingDown,
    },
    {
      title: t('stats.monthlyNetProfit'),
      value: formatCurrency(stats.monthlyNetProfit),
      description: `Net Margin ${stats.monthlyNetMargin}% (${calculatePercentageChange(
        stats.monthlyNetProfit,
        stats.monthlyNetProfitLastMonth,
        t('period.fromLastMonth'),
      )})`,
      icon: IconWallet,
    },
    {
      title: t('stats.monthlyNetProfitLastMonth'),
      value: formatCurrency(stats.monthlyNetProfitLastMonth),
      description: t('stats.monthlyNetProfitLastMonthDesc'),
      icon: IconWallet,
    },
    {
      title: t('stats.yearlyNetProfit'),
      value: formatCurrency(stats.yearlyNetProfit),
      description: `Net Margin ${stats.yearlyNetMargin}%`,
      icon: IconTrendingUp,
    },
  ]

  const allMetrics = [
    ...primaryStats,
    ...grossStats,
    ...expenseStats,
    ...netProfitStats,
  ]

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
      {allMetrics.map((stat, i) => (
        <StatsCard
          key={i}
          title={stat.title}
          value={stat.value}
          description={stat.description}
          icon={stat.icon}
        />
      ))}
    </div>
  )
}
