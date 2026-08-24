'use client'

import { useAnalyticsOverview } from '@/actions/hooks/analytics'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import {
  IconArrowUpRight,
  IconReceipt,
  IconShoppingCart,
  IconWallet,
} from '@tabler/icons-react'
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

import { BranchSelectField } from '@/components/BranchSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const DAYS = [
  'อาทิตย์',
  'จันทร์',
  'อังคาร',
  'พุธ',
  'พฤหัสบดี',
  'ศุกร์',
  'เสาร์',
]
const HOURS = Array.from({ length: 24 }, (_, i) => i)

export default function AnalyticsPage() {
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

  const { data, isLoading } = useAnalyticsOverview(
    selectedStoreId,
    selectedBranchId,
  )

  const totalRevenue =
    data?.financialTrend.reduce((acc, curr) => acc + curr.revenue, 0) ?? 0
  const totalNetProfit =
    data?.financialTrend.reduce((acc, curr) => acc + curr.netProfit, 0) ?? 0
  const totalOrders =
    data?.dayOfWeekTrend.reduce((acc, curr) => acc + curr.orderCount, 0) ?? 0
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  const maxOrderInHeatmap = Math.max(
    ...(data?.heatmap.map((h) => h.count) ?? [1]),
    1,
  )

  const getHeatmapColor = (count: number) => {
    if (count === 0) return 'bg-muted/30 text-muted-foreground'
    const intensity = count / maxOrderInHeatmap
    if (intensity < 0.25)
      return 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200'
    if (intensity < 0.5)
      return 'bg-blue-300 dark:bg-blue-800 text-blue-900 dark:text-blue-100'
    if (intensity < 0.75) return 'bg-blue-500 text-white font-bold'
    return 'bg-blue-700 text-white font-bold animate-pulse'
  }

  return (
    <Sidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              วิเคราะห์ภาพรวม
            </h1>
            <p className="text-muted-foreground text-sm">
              วิเคราะห์แนวโน้มกำไร วันขายดี Peak Hours สินค้าขายดี
              และรูปแบบสินค้าขายดี
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
          </div>
        </div>
        {isLoading ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
            <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
              <Skeleton className="h-96" />
              <Skeleton className="h-96" />
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <StatsCard
                title="ยอดขายรวม"
                value={formatCurrency(totalRevenue)}
                description="ยอดขายสะสมตามช่วงเวลา"
                icon={IconWallet as any}
              />
              <StatsCard
                title="กำไรสุทธิ"
                value={formatCurrency(totalNetProfit)}
                description="หักต้นทุนและค่าใช้จ่ายแล้ว"
                icon={IconArrowUpRight as any}
              />
              <StatsCard
                title="ออเดอร์ทั้งหมด"
                value={`${formatNumber(totalOrders)} รายการ`}
                description="จำนวนคำสั่งซื้อสำเร็จ"
                icon={IconShoppingCart as any}
              />
              <StatsCard
                title="ยอดเฉลี่ย/บิล (AOV)"
                value={formatCurrency(averageOrderValue)}
                description="ยอดใช้จ่ายต่อออเดอร์"
                icon={IconReceipt as any}
              />
            </div>
            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>สรุปผลประกอบการการเงิน (6 เดือนล่าสุด)</CardTitle>
                  <CardDescription>
                    แสดงยอดขาย, ต้นทุนสินค้า (COGS), ค่าใช้จ่ายดำเนินงาน
                    และกำไรสุทธิ
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.financialTrend ?? []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="period" />
                        <YAxis
                          tickFormatter={(v) => formatCurrency(v)}
                          width={80}
                        />
                        <Tooltip
                          formatter={(value) => [
                            formatCurrency(
                              typeof value === 'number' ? value : 0,
                            ),
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
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    5 อันดับสินค้าขายดีที่สุด (Top Products)
                  </CardTitle>
                  <CardDescription>เรียงตามจำนวนชิ้นที่ขายได้</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(data?.topProducts ?? []).length === 0 ? (
                      <div className="text-muted-foreground py-6 text-center text-sm">
                        ไม่มีข้อมูลสินค้า
                      </div>
                    ) : (
                      (data?.topProducts ?? []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between border-b pb-3 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="bg-primary/10 text-primary flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-muted-foreground text-xs">
                                ยอดขายรวม {formatCurrency(item.totalSales)}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-bold">
                            {formatNumber(item.quantity)} ชิ้น
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>
                    5 อันดับรูปแบบสินค้าขายดี (Top Variants)
                  </CardTitle>
                  <CardDescription>
                    รูปแบบ/แบบย่อยของสินค้าที่ลูกค้าสั่งซื้อมากที่สุด
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(data?.topVariants ?? []).length === 0 ? (
                      <div className="text-muted-foreground py-6 text-center text-sm">
                        ไม่มีข้อมูลรูปแบบสินค้า
                      </div>
                    ) : (
                      (data?.topVariants ?? []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between border-b pb-3 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-600">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="text-sm font-medium">{item.name}</p>
                              <p className="text-muted-foreground text-xs">
                                ยอดขายรวม {formatCurrency(item.totalSales)}
                              </p>
                            </div>
                          </div>
                          <span className="text-sm font-bold">
                            {formatNumber(item.quantity)} ชิ้น
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>ปริมาณออเดอร์และยอดขายตามวันในสัปดาห์</CardTitle>
                  <CardDescription>
                    ช่วยให้เห็นว่าวันไหนมีสถิติลูกค้าเข้าซื้อหนาแน่นที่สุด
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-72 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data?.dayOfWeekTrend ?? []}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="dayName" />
                        <YAxis
                          yAxisId="left"
                          orientation="left"
                          stroke="#22c55e"
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#3b82f6"
                        />
                        <Tooltip
                          formatter={(value, name) => [
                            name === 'ยอดขาย (บาท)'
                              ? formatCurrency(
                                  typeof value === 'number' ? value : 0,
                                )
                              : formatNumber(
                                  typeof value === 'number' ? value : 0,
                                ),
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
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    Heatmap ช่วงเวลาขายดี (Day x Hour Matrix)
                  </CardTitle>
                  <CardDescription>
                    ระดับสีเข้มแสดงถึงช่วงเวลาที่มีจำนวนคำสั่งซื้อหนาแน่นที่สุดในสัปดาห์
                  </CardDescription>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <div className="min-w-175">
                    <div className="mb-2 grid grid-cols-[80px_repeat(24,1fr)] gap-1 text-center text-xs font-semibold">
                      <div>วัน / เวลา</div>
                      {HOURS.map((h) => (
                        <div key={h}>{String(h).padStart(2, '0')}</div>
                      ))}
                    </div>
                    {DAYS.map((dayLabel, dayIdx) => (
                      <div
                        key={dayIdx}
                        className="mb-1 grid grid-cols-[80px_repeat(24,1fr)] items-center gap-1"
                      >
                        <div className="text-muted-foreground text-xs font-medium">
                          {dayLabel}
                        </div>
                        {HOURS.map((hour) => {
                          const cell = data?.heatmap.find(
                            (h) => h.dayOfWeek === dayIdx && h.hour === hour,
                          )
                          const count = cell?.count ?? 0
                          return (
                            <div
                              key={hour}
                              title={`${dayLabel} ${hour}:00 - ${count} ออเดอร์`}
                              className={`flex h-8 items-center justify-center rounded text-[10px] transition-all ${getHeatmapColor(
                                count,
                              )}`}
                            >
                              {count > 0 ? count : ''}
                            </div>
                          )
                        })}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    5 อันดับ ช่วงเวลาขายดีที่สุด (Peak Hours)
                  </CardTitle>
                  <CardDescription>
                    ช่วงเวลาที่มีการสร้างออเดอร์สูงสุดโดยรวม
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
                    {(data?.topBuyingHours ?? []).map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-card space-y-1 rounded-lg border p-4 text-center"
                      >
                        <div className="text-muted-foreground text-xs">
                          อันดับ {idx + 1}
                        </div>
                        <div className="text-base font-bold">{item.hour}</div>
                        <div className="text-primary text-sm font-semibold">
                          {formatNumber(item.count)} ออเดอร์
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </Sidebar>
  )
}
