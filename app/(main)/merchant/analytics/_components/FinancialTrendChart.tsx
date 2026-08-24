'use client'

import { formatCurrency } from '@/utils/pricing'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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

export function FinancialTrendChart({ data }: FinancialTrendChartProps) {
  return (
    <AnalyticsCardShell
      title="สรุปผลประกอบการการเงิน (6 เดือนล่าสุด)"
      description="แสดงยอดขาย, ต้นทุนสินค้า (COGS), ค่าใช้จ่ายดำเนินงาน และกำไรสุทธิ"
      isEmpty={data.length === 0}
      emptyMessage="ไม่มีข้อมูลผลประกอบการการเงิน"
      className="lg:col-span-2"
    >
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="period" />
            <YAxis tickFormatter={(v) => formatCurrency(v)} width={80} />
            <Tooltip
              formatter={(value) => [
                formatCurrency(typeof value === 'number' ? value : 0),
              ]}
            />
            <Legend />
            <Bar
              dataKey="revenue"
              name="ยอดขาย"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="cogs"
              name="ต้นทุนสินค้า"
              fill="#f97316"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="expense"
              name="ค่าใช้จ่าย"
              fill="#ef4444"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="netProfit"
              name="กำไรสุทธิ"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCardShell>
  )
}
