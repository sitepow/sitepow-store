'use client'

import { formatNumber } from '@/utils/formatting/number'
import { IconTrendingUp } from '@tabler/icons-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

import { AnalyticsCardShell } from './_components/AnalyticsCardShell'

interface PeakHoursCardProps {
  topBuyingHours: Array<{
    hour: string
    count: number
  }>
}

const chartConfig = {
  count: {
    label: 'จำนวนออเดอร์',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig

export function PeakHoursCard({ topBuyingHours }: PeakHoursCardProps) {
  return (
    <AnalyticsCardShell
      title="5 อันดับ ช่วงเวลาขายดีที่สุด (Peak Hours)"
      description="ช่วงเวลาที่มีการสร้างออเดอร์สูงสุดโดยรวม"
      isEmpty={topBuyingHours.length === 0}
      emptyMessage="ไม่มีข้อมูลช่วงเวลาขายดี"
      className="lg:col-span-2"
    >
      <div className="space-y-4">
        <div className="h-64 w-full">
          <ChartContainer config={chartConfig} className="h-full w-full">
            <AreaChart data={topBuyingHours} margin={{ left: 12, right: 12 }}>
              <defs>
                <linearGradient id="fillPeakCount" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="hour"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(v) => formatNumber(v)}
                width={40}
              />
              <ChartTooltip
                cursor={{ stroke: 'hsl(var(--muted))', strokeWidth: 1 }}
                content={
                  <ChartTooltipContent
                    hideLabel
                    formatter={(value) => [
                      `${formatNumber(typeof value === 'number' ? value : 0)} ออเดอร์`,
                    ]}
                  />
                }
              />
              <Area
                type="natural"
                dataKey="count"
                name="จำนวนออเดอร์"
                stroke="hsl(var(--primary))"
                fill="url(#fillPeakCount)"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        </div>
        <div className="text-muted-foreground flex items-center gap-2 border-t pt-2 text-xs">
          <IconTrendingUp className="size-4 text-emerald-500" />
          <span>ช่วงเวลาขายดีเรียงตามความหนาแน่นของออเดอร์</span>
        </div>
      </div>
    </AnalyticsCardShell>
  )
}
