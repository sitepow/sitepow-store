'use client'

import { formatDateTime } from '@/utils/formatting/date'
import { formatCurrency } from '@/utils/formatting/number'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import { AnalyticsCardShell } from '../../analytics/_components/shared/AnalyticsCardShell'

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

const chartConfig = {
  amount: {
    label: 'ยอดขาย',
    color: '#22c55e',
  },
} satisfies ChartConfig

export function RecentSalesChart({ data }: RecentSalesChartProps) {
  const recentSales = data?.recentSales ?? []

  const chartData = recentSales.map((sale) => ({
    ...sale,
    formattedDate: formatDateTime(sale.createdAt),
  }))

  return (
    <AnalyticsCardShell
      title="รายการขายล่าสุด"
      description="5 ออเดอร์ล่าสุดของสาขานี้"
      isEmpty={recentSales.length === 0}
      emptyMessage="ขณะนี้ยังไม่มียอดขายล่าสุดในสาขานี้"
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
                    `ลูกค้า: ${item.payload.name || 'ไม่ระบุชื่อ'}`,
                  ]}
                />
              }
            />
            <Area
              type="natural"
              dataKey="amount"
              name="ยอดขาย"
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
