'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'

import { formatDateTime } from '@/utils/date'
import { formatCurrency } from '@/utils/pricing'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import { AnalyticsCardShell } from '../../analytics/_components/_components/AnalyticsCardShell'

interface RecentSalesChartProps {
  data?: {
    recentSales?: Array<{
      id: string
      name: string
      email: string
      amount: number
      createdAt: string | Date
    }>
  }
}

export function RecentSalesChart({ data }: RecentSalesChartProps) {
  const t = useTranslations('merchant.dashboard.recentSales')
  const recentSales = data?.recentSales ?? []

  const chartConfig = useMemo(
    () =>
      ({
        amount: {
          label: t('sales'),
          color: '#22c55e',
        },
      }) satisfies ChartConfig,
    [t],
  )

  const chartData = recentSales.map((sale) => ({
    ...sale,
    formattedDate: formatDateTime(sale.createdAt),
  }))

  return (
    <AnalyticsCardShell
      title={t('title')}
      description={t('description')}
      isEmpty={recentSales.length === 0}
      emptyMessage={t('emptyMessage')}
    >
      <div className="h-64 w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={chartData} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillRecentSales" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="formattedDate"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => formatCurrency(v)}
              width={70}
            />
            <ChartTooltip
              cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => [
                    `+${formatCurrency(typeof value === 'number' ? value : 0)}`,
                    t('customer', {
                      name: item.payload.name || t('unnamedCustomer'),
                    }),
                  ]}
                />
              }
            />
            <Area
              type="natural"
              dataKey="amount"
              name={t('sales')}
              stroke="#22c55e"
              fill="url(#fillRecentSales)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </AnalyticsCardShell>
  )
}
