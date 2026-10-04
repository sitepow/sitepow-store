'use client'

import { PAYMENT_METHOD_TH } from '@/constants/i18n/translate'
import { PaymentMethod } from '@/generated/prisma/enums'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'

import { AnalyticsCardShell } from './shared/AnalyticsCardShell'

const PIE_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f97316',
  '#a855f7',
  '#ec4899',
  '#64748b',
]

interface PaymentBreakdownCardProps {
  paymentBreakdown: Array<{
    method: string
    count: number
    percentage: number
  }>
}

export function PaymentBreakdownCard({
  paymentBreakdown,
}: PaymentBreakdownCardProps) {
  const totalBills = paymentBreakdown.reduce((acc, curr) => acc + curr.count, 0)

  return (
    <AnalyticsCardShell
      title="ช่องทางการชำระเงิน (Payment Breakdown)"
      description="สัดส่วนวิธีชำระเงินของลูกค้าทั้งหมด"
      isEmpty={paymentBreakdown.length === 0}
      emptyMessage="ไม่มีข้อมูลการชำระเงิน"
    >
      <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="relative flex h-52 w-52 shrink-0 items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentBreakdown}
                dataKey="count"
                nameKey="method"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                paddingAngle={3}
                strokeWidth={0}
              >
                {paymentBreakdown.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                    className="transition-opacity duration-200 hover:opacity-80"
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload
                    const color = payload[0].color
                    return (
                      <div className="border-border/60 bg-popover/95 rounded-lg border p-2.5 shadow-md backdrop-blur-md">
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                          <span>
                            {PAYMENT_METHOD_TH[data.method as PaymentMethod] ||
                              data.method}
                          </span>
                        </div>
                        <div className="text-muted-foreground mt-1 text-xs">
                          {data.count} บิล ({data.percentage}%)
                        </div>
                      </div>
                    )
                  }
                  return null
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-muted-foreground text-xs font-medium">
              รวมทั้งหมด
            </span>
            <span className="text-foreground text-lg font-extrabold">
              {totalBills}
            </span>
            <span className="text-muted-foreground text-[10px]">รายการ</span>
          </div>
        </div>
        <div className="w-full flex-1 space-y-2">
          {paymentBreakdown.map((item, idx) => {
            const color = PIE_COLORS[idx % PIE_COLORS.length]
            const label =
              PAYMENT_METHOD_TH[item.method as PaymentMethod] || item.method

            return (
              <div
                key={idx}
                className="group border-border/40 bg-card hover:border-border relative rounded-xl border p-2.5 transition-all duration-200 hover:shadow-sm"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-full transition-transform group-hover:scale-110"
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-foreground truncate font-semibold">
                      {label}
                    </span>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5 font-medium">
                    <span className="text-foreground font-bold">
                      {item.count} บิล
                    </span>
                    <span className="text-muted-foreground">
                      ({item.percentage}%)
                    </span>
                  </div>
                </div>
                <div className="bg-muted/60 mt-2 h-1 w-full overflow-hidden rounded-full">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: color,
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </AnalyticsCardShell>
  )
}
