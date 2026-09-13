'use client'

import { useMemo } from 'react'

import { useTranslations } from 'next-intl'

import { useCurrentStore } from '@/hooks/use-current-store'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { IconTrendingUp } from '@tabler/icons-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import { AnalyticsCardShell } from '../../analytics/_components/_components/AnalyticsCardShell'

interface SalesTrendChartProps {
  data?: {
    salesTrend?: Array<{
      name: string
      total: number
    }>
  }
}

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const { currentStore, store } = useCurrentStore()
  const { formatCurrency } = useMerchantCurrency()
  const t = useTranslations('merchant.dashboard.salesTrend')
  const salesTrend = data?.salesTrend ?? []

  const chartConfig = useMemo(
    () =>
      ({
        total: {
          label: t('sales'),
          color: '#10b981',
        },
      }) satisfies ChartConfig,
    [t],
  )

  return (
    <AnalyticsCardShell
      style={
        {
          '--primary': currentStore?.primaryColor ?? store?.primaryColor,
        } as React.CSSProperties
      }
      title={t('title')}
      description={t('description')}
      isEmpty={salesTrend.length === 0}
      emptyMessage={t('emptyMessage')}
    >
      <div className="space-y-4">
        <ChartContainer config={chartConfig}>
          <AreaChart data={salesTrend} margin={{ left: 12, right: 12 }}>
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
              fill="var(--color-total)"
              fillOpacity={0.2}
              stroke="var(--color-total)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
        <div className="text-muted-foreground flex items-center gap-2 border-t pt-2 text-xs">
          <IconTrendingUp className="size-4 text-emerald-500" />
          <span>{t('last6Months')}</span>
        </div>
      </div>
    </AnalyticsCardShell>
  )
}
