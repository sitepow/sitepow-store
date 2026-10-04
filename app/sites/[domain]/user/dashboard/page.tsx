'use client'

import { useParams } from 'next/navigation'

import { useStorefrontDashboard } from '@/actions/storefront/dashboard/hooks'
import { AnalyticsCardShell } from '@/app/(main)/merchant/analytics/_components/_components/AnalyticsCardShell'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { BUYER_NAVIGATION } from '@/constants/navigation'
import { formatCurrency, formatNumber } from '@/utils/formatting/number'
import { IconArrowDownLeft, IconArrowUpRight } from '@tabler/icons-react'
import {
  Award,
  CreditCard,
  ShoppingBag,
  Ticket,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Sidebar } from '@/components/layout/Sidebar'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Skeleton } from '@/components/ui/skeleton'

const spendingChartConfig = {
  total: {
    label: 'ยอดซื้อรวม',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

const pointsChartConfig = {
  earned: {
    label: 'แต้มที่ได้รับ',
    color: 'hsl(var(--chart-1))',
  },
  used: {
    label: 'แต้มที่ใช้ไป',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig

export default function StoreUserDashboardPage() {
  const params = useParams()
  const storeSlug = params.domain as string

  const { data, isLoading } = useStorefrontDashboard(storeSlug)

  const stats = data?.stats
  const spendingTrend = data?.spendingTrend ?? []
  const pointsHistory = data?.pointsHistory ?? []

  const lastMonth = spendingTrend[spendingTrend.length - 1]?.total ?? 0
  const prevMonth = spendingTrend[spendingTrend.length - 2]?.total ?? 0
  const isSpendingUp = lastMonth >= prevMonth

  const statsData = stats
    ? [
        {
          title: 'ยอดซื้อสะสม (ร้านนี้)',
          value: formatCurrency(stats.totalSpent),
          description: 'ยอดรวมจากการสั่งซื้อสำเร็จทั้งหมด',
          icon: CreditCard,
        },
        {
          title: 'แต้มสะสมคงเหลือ',
          value: `${formatNumber(stats.rewardPoints)} แต้ม`,
          description: 'สามารถใช้เป็นส่วนลดในออเดอร์ถัดไป',
          icon: Award,
        },
        {
          title: 'คำสั่งซื้อทั้งหมดของคุณ',
          value: formatNumber(stats.totalOrders),
          description: `รอดำเนินการ ${stats.pendingOrders} รายการ`,
          icon: ShoppingBag,
        },
        {
          title: 'คูปองที่ใช้ได้',
          value: `${formatNumber(stats.availableCoupons)} ใบ`,
          description: 'คูปองของร้านนี้ที่ยังใช้งานได้ในขณะนี้',
          icon: Ticket,
        },
      ]
    : []

  return (
    <Sidebar redirectPath="user" items={BUYER_NAVIGATION}>
      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {statsData.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
              />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <AnalyticsCardShell
              title="ประวัติการใช้จ่ายของคุณ"
              description="แสดงยอดสรุปการซื้อสินค้าของคุณในรอบ 6 เดือนที่ผ่านมา"
              isEmpty={!spendingTrend || spendingTrend.length === 0}
              emptyMessage="ไม่มีข้อมูลประวัติการใช้จ่าย"
            >
              <div className="space-y-4">
                <ChartContainer config={spendingChartConfig}>
                  <AreaChart
                    accessibilityLayer
                    data={spendingTrend}
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
                      stroke="#888888"
                      fontSize={12}
                      tickFormatter={(value) => formatCurrency(value)}
                      width={60}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="line" />}
                    />
                    <Area
                      dataKey="total"
                      type="natural"
                      fill="var(--color-total)"
                      fillOpacity={0.4}
                      stroke="var(--color-total)"
                    />
                  </AreaChart>
                </ChartContainer>
                <div className="border-border/40 flex w-full items-start gap-2 border-t pt-2 text-sm">
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2 leading-none font-medium">
                      {isSpendingUp
                        ? 'คุณมียอดซื้อเพิ่มขึ้นในเดือนที่ผ่านมา'
                        : 'ยอดซื้อของคุณลดลงในเดือนที่ผ่านมา'}{' '}
                      {isSpendingUp ? (
                        <TrendingUp className="size-4" />
                      ) : (
                        <TrendingDown className="size-4" />
                      )}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 leading-none">
                      6 เดือนล่าสุด
                    </div>
                  </div>
                </div>
              </div>
            </AnalyticsCardShell>
            <AnalyticsCardShell
              title="ความเคลื่อนไหวของแต้มสะสม"
              description="เปรียบเทียบแต้มที่คุณได้รับและแต้มที่ใช้ไปในแต่ละเดือน"
              isEmpty={!pointsHistory || pointsHistory.length === 0}
              emptyMessage="ไม่มีข้อมูลความเคลื่อนไหวของแต้มสะสม"
            >
              <div className="space-y-4">
                <ChartContainer config={pointsChartConfig}>
                  <AreaChart
                    accessibilityLayer
                    data={pointsHistory}
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
                      stroke="#888888"
                      fontSize={12}
                      tickFormatter={(value) => `${formatNumber(value)} P`}
                      width={50}
                    />
                    <ChartTooltip
                      cursor={false}
                      content={<ChartTooltipContent indicator="dot" />}
                    />
                    <Area
                      dataKey="earned"
                      type="monotone"
                      fill="var(--color-earned)"
                      fillOpacity={0.3}
                      stroke="var(--color-earned)"
                      strokeWidth={2}
                    />
                    <Area
                      dataKey="used"
                      type="monotone"
                      fill="var(--color-used)"
                      fillOpacity={0.2}
                      stroke="var(--color-used)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ChartContainer>
                <div className="border-border/40 space-y-3 border-t pt-3">
                  <div className="flex w-full items-start gap-2 text-sm">
                    <div className="grid gap-1">
                      <div className="flex items-center gap-2 leading-none font-medium">
                        สะสมแต้มให้ครบเพื่อแลกรับส่วนลดพิเศษในออเดอร์ถัดไป
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 leading-none">
                        6 เดือนล่าสุด
                      </div>
                    </div>
                  </div>
                  <div className="text-muted-foreground border-border/40 flex w-full flex-wrap items-center gap-4 border-t pt-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="shrink-0 rounded-md border border-green-200 bg-green-50 p-1 text-green-600 dark:border-green-900/50 dark:bg-green-950 dark:text-green-400">
                        <IconArrowDownLeft size={14} />
                      </div>
                      <span>แต้มที่ได้รับ (Earned)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="shrink-0 rounded-md border border-red-200 bg-red-50 p-1 text-red-500 dark:border-red-900/50 dark:bg-red-950 dark:text-red-400">
                        <IconArrowUpRight size={14} />
                      </div>
                      <span>แต้มที่ใช้ (Used)</span>
                    </div>
                  </div>
                </div>
              </div>
            </AnalyticsCardShell>
          </div>
        </>
      )}
    </Sidebar>
  )
}
