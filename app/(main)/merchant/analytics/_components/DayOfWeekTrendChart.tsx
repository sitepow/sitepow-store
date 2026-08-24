'use client'

import { formatCurrency, formatNumber } from '@/utils/pricing'
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
  return (
    <AnalyticsCardShell
      title="ปริมาณออเดอร์และยอดขายตามวันในสัปดาห์"
      description="ช่วยให้เห็นว่าวันไหนมีสถิติลูกค้าเข้าซื้อหนาแน่นที่สุด"
      isEmpty={dayOfWeekTrend.length === 0}
      emptyMessage="ไม่มีข้อมูลแนวโน้มรายวัน"
      className="lg:col-span-2"
    >
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dayOfWeekTrend}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="dayName" />
            <YAxis yAxisId="left" orientation="left" stroke="#22c55e" />
            <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" />
            <Tooltip
              formatter={(value, name) => [
                name === 'ยอดขาย (บาท)'
                  ? formatCurrency(typeof value === 'number' ? value : 0)
                  : formatNumber(typeof value === 'number' ? value : 0),
                name,
              ]}
            />
            <Legend />
            <Bar
              yAxisId="left"
              dataKey="totalSales"
              name="ยอดขาย (บาท)"
              fill="#22c55e"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              yAxisId="right"
              dataKey="orderCount"
              name="จำนวนออเดอร์"
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCardShell>
  )
}
