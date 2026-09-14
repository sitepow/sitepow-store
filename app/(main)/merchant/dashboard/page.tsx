'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'

import { useDashboard } from '@/actions/hooks/dashboard'
import { useEmployeePermission } from '@/actions/hooks/employee'
import { StatsCard } from '@/components/StatsCard'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatNumber } from '@/utils/pricing'
import {
  IconBuildingStore,
  IconCurrencyDollar,
  IconExternalLink,
  IconLock,
  IconPackage,
  IconReceipt,
  IconReceiptOff,
  IconTrendingDown,
  IconTrendingUp,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

import { StoreCreditCard } from '../credits/_components/StoreCreditCard'
import { LowStockCard } from './_components/LowStockCard'
import { RecentSalesChart } from './_components/RecentSalesChart'
import { SalesTrendChart } from './_components/SalesTrendChart'

function pctChange(
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

export default function MerchantDashboardPage() {
  const t = useTranslations('merchant.dashboard')
  const { selectedStoreId, selectedStoreSlug } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()
  const { formatCurrency } = useMerchantCurrency()

  const {
    canViewDashboard,
    canViewCreditCard,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const { data, isLoading } = useDashboard(selectedStoreId, selectedBranchId)

  const stats = data?.stats

  const primaryStatsData = stats
    ? [
        {
          title: t('stats.dailySales'),
          value: formatCurrency(stats.dailySales),
          description: pctChange(
            stats.dailySales,
            stats.dailySalesYesterday,
            t('period.fromYesterday'),
          ),
          icon: IconBuildingStore,
        },
        {
          title: t('stats.totalRevenue'),
          value: formatCurrency(stats.totalRevenue),
          description: pctChange(
            stats.totalRevenue,
            stats.totalRevenueLastMonth,
            t('period.fromLastMonth'),
          ),
          icon: IconCurrencyDollar,
        },
        {
          title: t('stats.totalOrders'),
          value: formatNumber(stats.totalOrders),
          description: pctChange(
            stats.totalOrders,
            stats.totalOrdersLastMonth,
            t('period.fromLastMonth'),
          ),
          icon: IconPackage,
        },
        {
          title: t('stats.newCustomers'),
          value: formatNumber(stats.newCustomers),
          description: pctChange(
            stats.newCustomers,
            stats.newCustomersLastMonth,
            t('period.fromLastMonth'),
          ),
          icon: IconUsers,
        },
      ]
    : []

  const grossStatsData = stats
    ? [
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
          description: `Gross Margin ${stats.monthlyGrossProfit}% (${pctChange(
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
    : []

  const expenseStatsData = stats
    ? [
        {
          title: t('stats.dailyExpense'),
          value: formatCurrency(stats.dailyExpense),
          description: t('stats.dailyExpenseDesc'),
          icon: IconReceipt,
        },
        {
          title: t('stats.monthlyExpense'),
          value: formatCurrency(stats.monthlyExpense),
          description: pctChange(
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
          description: pctChange(
            stats.yearlyExpense,
            stats.yearlyExpenseLastYear,
            t('period.fromLastYear'),
          ),
          icon: IconReceipt,
        },
      ]
    : []

  const netProfitStatsData = stats
    ? [
        {
          title: t('stats.dailyNetProfit'),
          value: formatCurrency(stats.dailyNetProfit),
          description: t('stats.dailyNetProfitDesc'),
          icon: stats.dailyNetProfit >= 0 ? IconTrendingUp : IconTrendingDown,
        },
        {
          title: t('stats.monthlyNetProfit'),
          value: formatCurrency(stats.monthlyNetProfit),
          description: `Net Margin ${stats.monthlyNetMargin}% (${pctChange(
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
    : []

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <StoreSelectField />
          <BranchSelectField />
        </div>
        {selectedStoreId !== ALL_STORES && (
          <div className="flex flex-wrap gap-2.5">
            <Button variant="outline" asChild>
              <Link href="/merchant/settings" target="_blank">
                {t('settingsButton')} <IconExternalLink />
              </Link>
            </Button>
            {selectedStoreSlug && (
              <Button variant="outline" asChild>
                <Link
                  href={`https://${selectedStoreSlug}.sitepow.store`}
                  target="_blank"
                >
                  {t('viewStorefrontButton')} <IconExternalLink />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
      {selectedStoreId === ALL_STORES && <ActionRequiredAlert />}
      {selectedStoreId !== ALL_STORES && (isPermissionLoading || isLoading) && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(16)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      )}
      {selectedStoreId !== ALL_STORES &&
        !isPermissionLoading &&
        !canViewDashboard && (
          <ActionRequiredAlert
            icon={<IconLock />}
            title={t('noAccessTitle')}
            description={t('noAccessDescription')}
          />
        )}
      {selectedStoreId !== ALL_STORES &&
        !isPermissionLoading &&
        canViewDashboard &&
        !isLoading &&
        data && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
              {primaryStatsData.map((stat, i) => (
                <StatsCard
                  key={i}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  icon={stat.icon}
                />
              ))}
              {grossStatsData.map((stat, i) => (
                <StatsCard
                  key={i}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  icon={stat.icon}
                />
              ))}
              {expenseStatsData.map((stat, i) => (
                <StatsCard
                  key={i}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  icon={stat.icon}
                />
              ))}
              {netProfitStatsData.map((stat, i) => (
                <StatsCard
                  key={i}
                  title={stat.title}
                  value={stat.value}
                  description={stat.description}
                  icon={stat.icon}
                />
              ))}
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              {canViewCreditCard && <StoreCreditCard />}
              <SalesTrendChart data={data} />
              <RecentSalesChart data={data} />
              <LowStockCard data={data} />
            </div>
          </div>
        )}
    </Sidebar>
  )
}
