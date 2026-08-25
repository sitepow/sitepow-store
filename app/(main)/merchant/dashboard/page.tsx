'use client'

import Link from 'next/link'

import { useDashboard } from '@/actions/hooks/dashboard'
import { useEmployeePermission } from '@/actions/hooks/employee'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatDateTime } from '@/utils/date'
import { formatCurrency, formatNumber } from '@/utils/pricing'
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
import { ArrowRight } from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { AnalyticsCardShell } from '../analytics/_components/_components/AnalyticsCardShell'
import { StoreCreditCard } from '../credits/_components/StoreCreditCard'

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

const chartConfig = {
  total: { label: 'ยอดขาย', color: 'hsl(var(--primary))' },
} satisfies ChartConfig

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
              <AnalyticsCardShell
                title="แนวโน้มยอดขาย"
                description="ยอดขายสุทธิ 6 เดือนล่าสุด"
                isEmpty={!data?.salesTrend || data.salesTrend.length === 0}
                emptyMessage="ไม่มีข้อมูลแนวโน้มยอดขาย"
              >
                <div className="space-y-4">
                  <ChartContainer config={chartConfig}>
                    <AreaChart
                      data={data?.salesTrend ?? []}
                      margin={{ left: 12, right: 12 }}
                    >
                      <CartesianGrid vertical={false} />
                      <XAxis
                        dataKey="name"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                      />
                      <YAxis
                        tickLine={false}
                        axisLine={false}
                        tickMargin={8}
                        fontSize={12}
                        tickFormatter={(v) => formatCurrency(v)}
                        width={60}
                      />
                      <ChartTooltip
                        cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                        content={<ChartTooltipContent hideLabel />}
                      />
                      <Area
                        dataKey="total"
                        type="natural"
                        fill="hsl(var(--primary)/0.2)"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ChartContainer>
                  <div className="text-muted-foreground flex items-center gap-2 border-t pt-2 text-xs">
                    <IconTrendingUp className="size-4 text-emerald-500" />
                    <span>6 เดือนล่าสุด</span>
                  </div>
                </div>
              </AnalyticsCardShell>
              <AnalyticsCardShell
                title="รายการขายล่าสุด"
                description="5 ออเดอร์ล่าสุดของสาขานี้"
                isEmpty={(data?.recentSales ?? []).length === 0}
                emptyMessage="ขณะนี้ยังไม่มียอดขายล่าสุดในสาขานี้"
              >
                <div className="space-y-4">
                  {(data?.recentSales ?? []).map((sale) => {
                    const initial = sale.name
                      ? sale.name.charAt(0).toUpperCase()
                      : 'U'

                    return (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback>{initial}</AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <p className="text-sm leading-none font-medium">
                              {sale.name}
                            </p>
                            <p className="text-muted-foreground text-xs">
                              {sale.email}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            +{formatCurrency(sale.amount)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {formatDateTime(sale.createdAt)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </AnalyticsCardShell>
              <AnalyticsCardShell
                title="สินค้าใกล้หมด"
                description="รายการสินค้าที่ต้องเติมสต็อกด่วน"
                isEmpty={(data?.lowStock ?? []).length === 0}
                emptyMessage="ขณะนี้ยังไม่มีสินค้าที่ใกล้หมด"
                className="h-fit"
              >
                <div className="space-y-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableCell className="font-medium">
                          สินค้า / รหัสตัวเลือก / ชื่อตัวเลือก
                        </TableCell>
                        <TableCell className="font-medium">สาขา</TableCell>
                        <TableCell className="text-right font-medium">
                          คงเหลือ
                        </TableCell>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(data?.lowStock ?? []).map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="max-w-72 min-w-72 py-3 wrap-break-word whitespace-pre-line">
                            <div className="space-y-0.5">
                              <p className="text-sm font-medium">
                                {item.productName}
                              </p>
                              {item.variantId && (
                                <span className="text-muted-foreground text-xs">
                                  ({item.variantId})
                                  <br />
                                </span>
                              )}
                              {item.variantTitle && (
                                <span className="text-muted-foreground text-xs">
                                  ({item.variantTitle})
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="py-3">
                            <Badge
                              variant="outline"
                              className="text-muted-foreground"
                            >
                              {item.branchName}
                            </Badge>
                          </TableCell>
                          <TableCell className="py-3 text-right">
                            <span
                              className={`font-semibold ${
                                item.stock === 0
                                  ? 'text-destructive'
                                  : 'text-amber-500'
                              }`}
                            >
                              {formatNumber(item.stock)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <div className="border-t pt-2">
                    <Button variant="outline" className="w-full" asChild>
                      <Link href="/merchant/inventory">
                        ดูคลังสินค้าทั้งหมด <ArrowRight />
                      </Link>
                    </Button>
                  </div>
                </div>
              </AnalyticsCardShell>
            </div>
          </div>
        )}
    </Sidebar>
  )
}
