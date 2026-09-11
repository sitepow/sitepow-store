'use client'

import { useCurrentStore } from '@/hooks/use-current-store'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'

import { formatCurrency, formatNumber } from '@/utils/pricing'
import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import { AnalyticsCardShell } from './_components/AnalyticsCardShell'

interface DayOfWeekTrendChartProps {
  dayOfWeekTrend: Array<{
    dayName: string
    totalSales: number
    orderCount: number
  }>
}

export function DayOfWeekTrendChart({
  dayOfWeekTrend,
}: DayOfWeekTrendChartProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.analytics.dayOfWeekTrend')

  const chartConfig = useMemo(
    () =>
      ({
        totalSales: { label: t('salesLabel'), color: '#22c55e' },
        orderCount: { label: t('ordersLabel'), color: '#3b82f6' },
      }) satisfies ChartConfig,
    [t],
  )

  return (
    <AnalyticsCardShell
      style={{
        '--primary': currentStore?.primaryColor ?? store?.primaryColor,
      } as React.CSSProperties}
      title={t('title')}
      description={t('description')}
      isEmpty={dayOfWeekTrend.length === 0}
      emptyMessage={t('emptyMessage')}
      className="lg:col-span-2"
    >
      <div className="h-72 w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={dayOfWeekTrend} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillTotalSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillOrderCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="dayName"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              yAxisId="left"
              orientation="left"
              stroke="#22c55e"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => formatCurrency(v)}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              stroke="#3b82f6"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => formatNumber(v)}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => [
                    name === 'totalSales' || name === t('salesLabel')
                      ? formatCurrency(typeof value === 'number' ? value : 0)
                      : formatNumber(typeof value === 'number' ? value : 0),
                  ]}
                />
              }
            />
            <Legend />
            <Area
              yAxisId="left"
              type="natural"
              dataKey="totalSales"
              name={t('salesLabel')}
              stroke="#22c55e"
              fill="url(#fillTotalSales)"
              strokeWidth={2}
            />
            <Area
              yAxisId="right"
              type="natural"
              dataKey="orderCount"
              name={t('ordersLabel')}
              stroke="#3b82f6"
              fill="url(#fillOrderCount)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </AnalyticsCardShell>
  )
}
