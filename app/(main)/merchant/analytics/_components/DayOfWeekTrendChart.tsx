'use client'

import { formatCurrency, formatNumber } from '@/utils/formatting/number'
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

const chartConfig = {
  totalSales: { label: 'ยอดขาย (บาท)', color: '#22c55e' },
  orderCount: { label: 'จำนวนออเดอร์', color: '#3b82f6' },
} satisfies ChartConfig

export function DayOfWeekTrendChart({
  dayOfWeekTrend,
}: DayOfWeekTrendChartProps) {
  return (
    <AnalyticsCardShell
      title="ปริมาณออเดอร์และยอดขายตามวันในสัปดาห์"
      description="ช่วยให้เห็นว่าวันไหนมีสถิติลูกค้าเข้าซื้อหนาแน่นที่สุด"
      isEmpty={dayOfWeekTrend.length === 0}
      emptyMessage="ไม่มีข้อมูลแนวโน้มรายวัน"
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
                    name === 'totalSales' || name === 'ยอดขาย (บาท)'
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
              name="ยอดขาย (บาท)"
              stroke="#22c55e"
              fill="url(#fillTotalSales)"
              strokeWidth={2}
            />
            <Area
              yAxisId="right"
              type="natural"
              dataKey="orderCount"
              name="จำนวนออเดอร์"
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
