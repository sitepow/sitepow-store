'use client'

import { useState } from 'react'

import { generateAnalyticsInsightsAi } from '@/actions/ai'
import { useAnalyticsOverview } from '@/actions/hooks/analytics'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { DAYS, HOURS } from '@/constants/system'
import { PAYMENT_METHOD_TH } from '@/constants/translate'
import { PaymentMethod } from '@/generated/prisma/enums'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import {
  IconArrowUpRight,
  IconClock,
  IconCreditCard,
  IconPackage,
  IconReceipt,
  IconShoppingCart,
  IconSparkles,
  IconTarget,
  IconUserCheck,
  IconUsers,
  IconWallet,
} from '@tabler/icons-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { BranchSelectField } from '@/components/BranchSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Sidebar } from '@/components/layout/Sidebar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

const PIE_COLORS = [
  '#3b82f6',
  '#22c55e',
  '#f97316',
  '#a855f7',
  '#ec4899',
  '#64748b',
]

interface AiInsightsData {
  businessSummary: string
  operatingHoursStrategy: {
    recommendedStartHour: string
    peakHoursNotice: string
    actionPlan: string
  }
  productAndBundlingStrategy: {
    topProductInsight: string
    bundleSuggestions: Array<{
      pairName: string
      promotionIdea: string
    }>
  }
  retentionAndMarketingStrategy: {
    customerInsight: string
    actionableSteps: string[]
  }
}

export default function AnalyticsPage() {
  const { selectedStoreId } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

  const { data, isLoading } = useAnalyticsOverview(
    selectedStoreId,
    selectedBranchId,
  )

  const [aiInsights, setAiInsights] = useState<AiInsightsData | null>(null)
  const [isGeneratingAi, setIsGeneratingAi] = useState(false)

  const handleGenerateAiInsights = async () => {
    if (!selectedStoreId || !data) {
      return
    }

    setIsGeneratingAi(true)

    try {
      const res = await generateAnalyticsInsightsAi(data, selectedStoreId)
      if (res.success && res.data) {
        setAiInsights(res.data)
      } else {
        alert(res.message || 'เกิดข้อผิดพลาดในการสร้างคำแนะนำจาก AI')
      }
    } catch (error) {
      console.error(error)
      alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์')
    } finally {
      setIsGeneratingAi(false)
    }
  }

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
    if (count === 0) {
      return 'bg-muted/30 text-muted-foreground'
    }

    const intensity = count / maxOrderInHeatmap

    if (intensity < 0.25) {
      return 'bg-blue-100 dark:bg-blue-950 text-blue-900 dark:text-blue-200'
    }

    if (intensity < 0.5) {
      return 'bg-blue-300 dark:bg-blue-800 text-blue-900 dark:text-blue-100'
    }

    if (intensity < 0.75) {
      return 'bg-blue-500 text-white font-bold'
    }

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
              และพฤติกรรมลูกค้า
            </p>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <StoreSelectField />
            <BranchSelectField />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleGenerateAiInsights}
            disabled={isGeneratingAi || isLoading || !data}
            className="gap-2 bg-purple-600 text-white hover:bg-purple-700"
          >
            <IconSparkles className="h-4 w-4" />
            {isGeneratingAi ? 'กำลังวิเคราะห์กลยุทธ์...' : 'สรุปกลยุทธ์ด้วย AI'}
          </Button>
        </div>
        {aiInsights && (
          <Card className="border-purple-200 bg-purple-50/30 dark:bg-purple-950/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <IconSparkles className="h-5 w-5" />
                บทวิเคราะห์และกลยุทธ์จาก AI (AI Business Insights)
              </CardTitle>
              <CardDescription>{aiInsights.businessSummary}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div className="bg-card space-y-1 rounded-lg border p-3">
                  <div className="flex items-center gap-2 font-semibold text-blue-600 dark:text-blue-400">
                    <IconClock className="h-4 w-4" /> กลยุทธ์เวลาเปิด-ปิดร้าน
                  </div>
                  <p className="text-xs font-bold">
                    เวลาที่ควรเปิด:{' '}
                    {aiInsights.operatingHoursStrategy.recommendedStartHour}
                  </p>
                  <p className="text-muted-foreground text-xs">
                    {aiInsights.operatingHoursStrategy.peakHoursNotice}
                  </p>
                  <p className="text-muted-foreground text-xs font-medium">
                    {aiInsights.operatingHoursStrategy.actionPlan}
                  </p>
                </div>
                <div className="bg-card space-y-1 rounded-lg border p-3">
                  <div className="flex items-center gap-2 font-semibold text-orange-600 dark:text-orange-400">
                    <IconPackage className="h-4 w-4" /> การดันยอดสินค้า &
                    โปรโมชั่น
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {aiInsights.productAndBundlingStrategy.topProductInsight}
                  </p>
                  {aiInsights.productAndBundlingStrategy.bundleSuggestions.map(
                    (bundle, idx) => (
                      <div key={idx} className="mt-1 text-xs">
                        <span className="font-semibold text-purple-600 dark:text-purple-400">
                          {bundle.pairName}:
                        </span>{' '}
                        <span className="text-muted-foreground">
                          {bundle.promotionIdea}
                        </span>
                      </div>
                    ),
                  )}
                </div>
                <div className="bg-card space-y-1 rounded-lg border p-3">
                  <div className="flex items-center gap-2 font-semibold text-emerald-600 dark:text-emerald-400">
                    <IconTarget className="h-4 w-4" /> การดึงดูดลูกค้าเดิม
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {aiInsights.retentionAndMarketingStrategy.customerInsight}
                  </p>
                </div>
              </div>
              <div className="border-t pt-3">
                <p className="mb-2 text-xs font-semibold">
                  ข้อแนะนำที่ร้านค้าควรปรับทำทันที (Action Items):
                </p>
                <ul className="text-muted-foreground list-inside list-disc space-y-1 text-xs">
                  {aiInsights.retentionAndMarketingStrategy.actionableSteps.map(
                    (step, idx) => (
                      <li key={idx}>{step}</li>
                    ),
                  )}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}
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
                icon={IconWallet}
              />
              <StatsCard
                title="กำไรสุทธิ"
                value={formatCurrency(totalNetProfit)}
                description="หักต้นทุนและค่าใช้จ่ายแล้ว"
                icon={IconArrowUpRight}
              />
              <StatsCard
                title="ออเดอร์ทั้งหมด"
                value={`${formatNumber(totalOrders)} รายการ`}
                description="จำนวนคำสั่งซื้อสำเร็จ"
                icon={IconShoppingCart}
              />
              <StatsCard
                title="ยอดเฉลี่ย/บิล (AOV)"
                value={formatCurrency(averageOrderValue)}
                description="ยอดใช้จ่ายต่อออเดอร์"
                icon={IconReceipt}
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
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>
                    การวิเคราะห์กลุ่มลูกค้า (Customer Retention)
                  </CardTitle>
                  <CardDescription>
                    อัตราการซื้อซ้ำและพฤติกรรมระหว่างลูกค้าใหม่กับลูกค้าเดิม
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    <StatsCard
                      title="ลูกค้าทั้งหมด"
                      value={`${formatNumber(data?.customerRetention.totalUniqueCustomers ?? 0)} ราย`}
                      description="จำนวนลูกค้าที่ไม่ซ้ำกัน"
                      icon={IconUsers as any}
                    />
                    <StatsCard
                      title="ลูกค้าใหม่"
                      value={`${formatNumber(data?.customerRetention.newCustomersCount ?? 0)} ราย`}
                      description="ซื้อครั้งแรกในช่วงนี้"
                      icon={IconUserCheck}
                    />
                    <StatsCard
                      title="ลูกค้าเก่าซื้อซ้ำ"
                      value={`${formatNumber(data?.customerRetention.returningCustomersCount ?? 0)} ราย`}
                      description="มีการสั่งซื้อมากกว่า 1 ครั้ง"
                      icon={IconUserCheck}
                    />
                    <StatsCard
                      title="Repeat Purchase Rate"
                      value={`${data?.customerRetention.repeatPurchaseRate ?? 0}%`}
                      description="อัตราส่วนการกลับมาซื้อซ้ำ"
                      icon={IconArrowUpRight}
                    />
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
              <Card>
                <CardHeader>
                  <CardTitle>คู่สินค้าที่มักจะถูกซื้อร่วมกัน</CardTitle>
                  <CardDescription>
                    วิเคราะห์สินค้าที่ถูกสั่งซื้อพร้อมกันในออเดอร์เดียวกันบ่อยที่สุด
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(data?.topProductPairs ?? []).length === 0 ? (
                      <div className="text-muted-foreground py-6 text-center text-sm">
                        ไม่มีข้อมูลการซื้อร่วมกัน
                      </div>
                    ) : (
                      (data?.topProductPairs ?? []).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between border-b pb-3 last:border-0"
                        >
                          <div className="flex items-center gap-3">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-purple-500/10 text-xs font-bold text-purple-600">
                              {idx + 1}
                            </span>
                            <span className="text-sm font-medium">
                              {item.pair}
                            </span>
                          </div>
                          <span className="text-sm font-bold">
                            {formatNumber(item.count)} ออเดอร์
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <IconCreditCard className="h-5 w-5" /> ช่องทางการชำระเงิน
                  </CardTitle>
                  <CardDescription>
                    สัดส่วนวิธีชำระเงินของลูกค้าทั้งหมด
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(data?.paymentBreakdown ?? []).length === 0 ? (
                    <div className="text-muted-foreground py-6 text-center text-sm">
                      ไม่มีข้อมูลการชำระเงิน
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
                      <div className="h-48 w-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={data?.paymentBreakdown ?? []}
                              dataKey="count"
                              nameKey="method"
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={70}
                              paddingAngle={4}
                            >
                              {(data?.paymentBreakdown ?? []).map(
                                (_, index) => (
                                  <Cell
                                    key={`cell-${index}`}
                                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                                  />
                                ),
                              )}
                            </Pie>
                            <Tooltip
                              formatter={(value) => [
                                `${value} ออเดอร์`,
                                'จำนวน',
                              ]}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div className="w-full flex-1 space-y-2">
                        {(data?.paymentBreakdown ?? []).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between text-sm"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className="h-3 w-3 rounded-full"
                                style={{
                                  backgroundColor:
                                    PIE_COLORS[idx % PIE_COLORS.length],
                                }}
                              />
                              <span>
                                {
                                  PAYMENT_METHOD_TH[
                                    item.method as PaymentMethod
                                  ]
                                }
                              </span>
                            </div>
                            <div className="font-semibold">
                              {item.count} บิล ({item.percentage}%)
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
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
