'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'

import { useStorefrontDashboard } from '@/actions/hooks/storefront/dashboard'
import { AnalyticsCardShell } from '@/app/(main)/merchant/analytics/_components/_components/AnalyticsCardShell'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { BUYER_NAVIGATION } from '@/constants/navigation'
import { useStoreData } from '@/stores/sites/use-store-data'
import { useStorefrontCurrency } from '@/stores/use-currency-store'
import { formatCurrency, formatNumber } from '@/utils/pricing'
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

export default function StoreUserDashboardPage() {
  const t = useTranslations('customer.dashboard')
  const params = useParams()
  const storeSlug = params.domain as string
  const { store } = useStoreData()
  const { currentCurrency, convert } = useStorefrontCurrency(
    (store as any)?.baseCurrency,
  )

  const { data, isLoading } = useStorefrontDashboard(storeSlug)

  const stats = data?.stats
  const spendingTrend = data?.spendingTrend ?? []
  const pointsHistory = data?.pointsHistory ?? []

  const lastMonth = spendingTrend[spendingTrend.length - 1]?.total ?? 0
  const prevMonth = spendingTrend[spendingTrend.length - 2]?.total ?? 0
  const isSpendingUp = lastMonth >= prevMonth

  const spendingChartConfig = useMemo(
    () =>
      ({
        total: {
          label: t('totalSpent'),
          color: 'hsl(var(--primary))',
        },
      }) satisfies ChartConfig,
    [t],
  )

  const pointsChartConfig = useMemo(
    () =>
      ({
        earned: {
          label: t('earnedPointsLabel'),
          color: 'hsl(var(--chart-1))',
        },
        used: {
          label: t('usedPointsLabel'),
          color: 'hsl(var(--chart-2))',
        },
      }) satisfies ChartConfig,
    [t],
  )

  const statsData = stats
    ? [
        {
          title: t('totalSpentStore'),
          value: formatCurrency(convert(stats.totalSpent), currentCurrency),
          description: t('totalSpentDesc'),
          icon: CreditCard,
        },
        {
          title: t('rewardPoints'),
          value: `${formatNumber(stats.rewardPoints)} ${t('pointsUnit')}`,
          description: t('rewardPointsDesc'),
          icon: Award,
        },
        {
          title: t('totalOrders'),
          value: formatNumber(stats.totalOrders),
          description: t('pendingOrders', { count: stats.pendingOrders }),
          icon: ShoppingBag,
        },
        {
          title: t('availableCoupons'),
          value: `${formatNumber(stats.availableCoupons)} ${t('couponsUnit')}`,
          description: t('availableCouponsDesc'),
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
              title={t('spendingHistoryTitle')}
              description={t('spendingHistoryDesc')}
              isEmpty={!spendingTrend || spendingTrend.length === 0}
              emptyMessage={t('emptySpending')}
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
                      tickFormatter={(value) =>
                        formatCurrency(convert(value), currentCurrency)
                      }
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
                      {isSpendingUp ? t('spendingUp') : t('spendingDown')}{' '}
                      {isSpendingUp ? (
                        <TrendingUp className="size-4" />
                      ) : (
                        <TrendingDown className="size-4" />
                      )}
                    </div>
                    <div className="text-muted-foreground flex items-center gap-2 leading-none">
                      {t('last6Months')}
                    </div>
                  </div>
                </div>
              </div>
            </AnalyticsCardShell>
            <AnalyticsCardShell
              title={t('pointsHistoryTitle')}
              description={t('pointsHistoryDesc')}
              isEmpty={!pointsHistory || pointsHistory.length === 0}
              emptyMessage={t('emptyPoints')}
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
                        {t('pointsTip')}
                      </div>
                      <div className="text-muted-foreground flex items-center gap-2 leading-none">
                        {t('last6Months')}
                      </div>
                    </div>
                  </div>
                  <div className="text-muted-foreground border-border/40 flex w-full flex-wrap items-center gap-4 border-t pt-3 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="shrink-0 rounded-md border border-green-200 bg-green-50 p-1 text-green-600 dark:border-green-900/50 dark:bg-green-950 dark:text-green-400">
                        <IconArrowDownLeft size={14} />
                      </div>
                      <span>{t('earnedPointsLabel')}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="shrink-0 rounded-md border border-red-200 bg-red-50 p-1 text-red-500 dark:border-red-900/50 dark:bg-red-950 dark:text-red-400">
                        <IconArrowUpRight size={14} />
                      </div>
                      <span>{t('usedPointsLabel')}</span>
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
