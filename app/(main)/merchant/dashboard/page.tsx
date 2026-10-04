'use client'

import Link from 'next/link'

import { useDashboard } from '@/actions/analytics/dashboard/hooks'
import { useEmployeePermission } from '@/actions/store/employee/hooks'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { MERCHANT_NAVIGATION } from '@/constants/store/navigation'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/formatting/number'
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

import { ActionRequiredAlert } from '@/components/shared/ActionRequiredAlert'
import { BranchSelectField } from '@/components/form/BranchSelectField'
import { StoreSelectField } from '@/components/form/StoreSelectField'
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
  periodLabel: string = 'จากเดือนที่แล้ว',
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
  const { selectedStoreId, selectedStoreSlug } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

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
          title: 'ยอดขายวันนี้',
          value: formatCurrency(stats.dailySales),
          description: pctChange(
            stats.dailySales,
            stats.dailySalesYesterday,
            'จากเมื่อวาน',
          ),
          icon: IconBuildingStore,
        },
        {
          title: 'ยอดขายเดือนนี้',
          value: formatCurrency(stats.totalRevenue),
          description: pctChange(
            stats.totalRevenue,
            stats.totalRevenueLastMonth,
            'จากเดือนที่แล้ว',
          ),
          icon: IconCurrencyDollar,
        },
        {
          title: 'คำสั่งซื้อเดือนนี้',
          value: formatNumber(stats.totalOrders),
          description: pctChange(
            stats.totalOrders,
            stats.totalOrdersLastMonth,
            'จากเดือนที่แล้ว',
          ),
          icon: IconPackage,
        },
        {
          title: 'ลูกค้าใหม่เดือนนี้',
          value: formatNumber(stats.newCustomers),
          description: pctChange(
            stats.newCustomers,
            stats.newCustomersLastMonth,
            'จากเดือนที่แล้ว',
          ),
          icon: IconUsers,
        },
      ]
    : []

  const grossStatsData = stats
    ? [
        {
          title: 'กำไรขั้นต้นวันนี้',
          value: formatCurrency(stats.dailyGrossProfit),
          description: `Gross Margin ${stats.dailyGrossMargin}%`,
          icon: stats.dailyGrossProfit >= 0 ? IconTrendingUp : IconTrendingDown,
        },
        {
          title: 'ต้นทุนสินค้าขายเดือนนี้ (COGS)',
          value: formatCurrency(stats.monthlyCOGS),
          description: 'รวมต้นทุนสินค้าที่ขายได้จริง',
          icon: IconReceiptOff,
        },
        {
          title: 'กำไรขั้นต้นเดือนนี้ (Gross Profit)',
          value: formatCurrency(stats.monthlyGrossProfit),
          description: `Gross Margin ${stats.monthlyGrossProfit}% (${pctChange(
            stats.monthlyGrossProfit,
            stats.monthlyGrossProfitLastMonth,
            'จากเดือนที่แล้ว',
          )})`,
          icon: IconTrendingUp,
        },
        {
          title: 'กำไรขั้นต้นเดือนก่อน',
          value: formatCurrency(stats.monthlyGrossProfitLastMonth),
          description: 'ยอดสรุปกำไรขั้นต้นเดือนที่แล้ว',
          icon: IconTrendingUp,
        },
      ]
    : []

  const expenseStatsData = stats
    ? [
        {
          title: 'ค่าใช้จ่ายวันนี้',
          value: formatCurrency(stats.dailyExpense),
          description: 'รวมค่าใช้จ่ายดำเนินงานวันนี้',
          icon: IconReceipt,
        },
        {
          title: 'ค่าใช้จ่ายเดือนนี้',
          value: formatCurrency(stats.monthlyExpense),
          description: pctChange(
            stats.monthlyExpense,
            stats.monthlyExpenseLastMonth,
            'จากเดือนที่แล้ว',
          ),
          icon: IconReceipt,
        },
        {
          title: 'ค่าใช้จ่ายเดือนก่อน',
          value: formatCurrency(stats.monthlyExpenseLastMonth),
          description: 'ยอดสรุปค่าใช้จ่ายดำเนินงานเดือนที่แล้ว',
          icon: IconReceipt,
        },
        {
          title: 'ค่าใช้จ่ายปีนี้',
          value: formatCurrency(stats.yearlyExpense),
          description: pctChange(
            stats.yearlyExpense,
            stats.yearlyExpenseLastYear,
            'จากปีที่แล้ว',
          ),
          icon: IconReceipt,
        },
      ]
    : []

  const netProfitStatsData = stats
    ? [
        {
          title: 'กำไรสุทธิวันนี้',
          value: formatCurrency(stats.dailyNetProfit),
          description: 'หักต้นทุนสินค้าและค่าใช้จ่ายแล้ว',
          icon: stats.dailyNetProfit >= 0 ? IconTrendingUp : IconTrendingDown,
        },
        {
          title: 'กำไรสุทธิเดือนนี้',
          value: formatCurrency(stats.monthlyNetProfit),
          description: `Net Margin ${stats.monthlyNetMargin}% (${pctChange(
            stats.monthlyNetProfit,
            stats.monthlyNetProfitLastMonth,
            'จากเดือนที่แล้ว',
          )})`,
          icon: IconWallet,
        },
        {
          title: 'กำไรสุทธิเดือนก่อน',
          value: formatCurrency(stats.monthlyNetProfitLastMonth),
          description: 'ยอดสรุปกำไรสุทธิเดือนที่แล้ว',
          icon: IconWallet,
        },
        {
          title: 'กำไรสุทธิปีนี้',
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
                ตั้งค่าร้านค้า <IconExternalLink />
              </Link>
            </Button>
            {selectedStoreSlug && (
              <Button variant="outline" asChild>
                <Link
                  href={`https://${selectedStoreSlug}.sitepow.store`}
                  target="_blank"
                >
                  ดูหน้าร้านออนไลน์ของคุณ <IconExternalLink />
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
            title="ไม่มีสิทธิ์เข้าถึง"
            description="คุณไม่มีสิทธิ์ในการดูข้อมูลแดชบอร์ดของสาขาหรือร้านค้านี้"
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
