'use client'

import { formatCurrency } from '@/utils/formatting/number'
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { AnalyticsCardShell } from './_components/AnalyticsCardShell'

interface TopProductsCardProps {
  topProducts: Array<{
    name: string
    totalSales: number
    quantity: number
  }>
}

export function TopProductsCard({ topProducts }: TopProductsCardProps) {
  return (
    <AnalyticsCardShell
      title="5 อันดับสินค้าขายดีที่สุด (Top Products)"
      description="เปรียบเทียบปริมาณการขายแต่ละสินค้า"
      isEmpty={topProducts.length === 0}
      emptyMessage="ไม่มีข้อมูลสินค้า"
    >
      <div className="h-70 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={topProducts}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="quantityGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#f97316" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              opacity={0.15}
              vertical={false}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              className="fill-muted-foreground text-xs"
              tickFormatter={(value) =>
                value.length > 8 ? `${value.slice(0, 8)}...` : value
              }
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="fill-muted-foreground text-xs"
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="border-border/50 bg-background/95 space-y-1 rounded-lg border p-2.5 text-xs shadow-md backdrop-blur-sm">
                      <p className="text-foreground font-semibold">
                        {data.name}
                      </p>
                      <p className="font-medium text-orange-500">
                        จำนวนที่ขายได้: {data.quantity} ชิ้น
                      </p>
                      <p className="text-muted-foreground">
                        ยอดขายรวม: {formatCurrency(data.totalSales)}
                      </p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Area
              type="monotone"
              dataKey="quantity"
              stroke="#f97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#quantityGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </AnalyticsCardShell>
  )
}
