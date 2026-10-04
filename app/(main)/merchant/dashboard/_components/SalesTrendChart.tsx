'use client'

import { formatCurrency } from '@/utils/formatting/number'
import { IconTrendingUp } from '@tabler/icons-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import { AnalyticsCardShell } from '../../analytics/_components/shared/AnalyticsCardShell'

interface SalesTrendChartProps {
  data?: {
    salesTrend?: Array<{
      name: string
      total: number
    }>
  }
}

const chartConfig = {
  total: {
    label: 'ยอดขาย',
    color: '#10b981',
  },
} satisfies ChartConfig

export function SalesTrendChart({ data }: SalesTrendChartProps) {
  const salesTrend = data?.salesTrend ?? []

  return (
    <AnalyticsCardShell
      title="แนวโน้มยอดขาย"
      description="ยอดขายสุทธิ 6 เดือนล่าสุด"
      isEmpty={salesTrend.length === 0}
      emptyMessage="ไม่มีข้อมูลแนวโน้มยอดขาย"
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
          <span>6 เดือนล่าสุด</span>
        </div>
      </div>
    </AnalyticsCardShell>
  )
}
