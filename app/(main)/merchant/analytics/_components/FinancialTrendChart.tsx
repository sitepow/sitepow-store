'use client'

import { formatCurrency } from '@/utils/formatting/number'
import { Area, AreaChart, CartesianGrid, Legend, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import { AnalyticsCardShell } from './_components/AnalyticsCardShell'

interface FinancialTrendChartProps {
  data: Array<{
    period: string
    revenue: number
    cogs: number
    expense: number
    netProfit: number
  }>
}

const chartConfig = {
  revenue: { label: 'ยอดขาย', color: '#22c55e' },
  cogs: { label: 'ต้นทุนสินค้า', color: '#f97316' },
  expense: { label: 'ค่าใช้จ่าย', color: '#ef4444' },
  netProfit: { label: 'กำไรสุทธิ', color: '#3b82f6' },
} satisfies ChartConfig

export function FinancialTrendChart({ data }: FinancialTrendChartProps) {
  return (
    <AnalyticsCardShell
      title="สรุปผลประกอบการการเงิน"
      description="แสดงยอดขาย, ต้นทุนสินค้า (COGS), ค่าใช้จ่ายดำเนินงาน และกำไรสุทธิ"
      isEmpty={data.length === 0}
      emptyMessage="ไม่มีข้อมูลผลประกอบการการเงิน"
      className="lg:col-span-2"
    >
      <div className="h-80 w-full">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <AreaChart data={data} margin={{ left: 12, right: 12 }}>
            <defs>
              <linearGradient id="fillRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillCogs" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillExpense" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="fillNetProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="period"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(v) => formatCurrency(v)}
              width={80}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) =>
                    formatCurrency(typeof value === 'number' ? value : 0)
                  }
                />
              }
            />
            <Legend />
            <Area
              type="natural"
              dataKey="revenue"
              name="ยอดขาย"
              stroke="#22c55e"
              fill="url(#fillRevenue)"
              strokeWidth={2}
            />
            <Area
              type="natural"
              dataKey="cogs"
              name="ต้นทุนสินค้า"
              stroke="#f97316"
              fill="url(#fillCogs)"
              strokeWidth={2}
            />
            <Area
              type="natural"
              dataKey="expense"
              name="ค่าใช้จ่าย"
              stroke="#ef4444"
              fill="url(#fillExpense)"
              strokeWidth={2}
            />
            <Area
              type="natural"
              dataKey="netProfit"
              name="กำไรสุทธิ"
              stroke="#3b82f6"
              fill="url(#fillNetProfit)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </div>
    </AnalyticsCardShell>
  )
}
