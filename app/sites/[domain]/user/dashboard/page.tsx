'use client'

import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { BUYER_NAVIGATION } from '@/constants/navigation'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { IconArrowDownLeft, IconArrowUpRight } from '@tabler/icons-react'
import {
  Award,
  CreditCard,
  ShoppingBag,
  Ticket,
  TrendingUp,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

export default function StoreUserDashboardPage() {
  const SPENDING_DATA = [
    { name: 'ม.ค.', total: 1200 },
    { name: 'ก.พ.', total: 850 },
    { name: 'มี.ค.', total: 2300 },
    { name: 'เม.ย.', total: 1500 },
    { name: 'พ.ค.', total: 3100 },
    { name: 'มิ.ย.', total: 1850 },
  ]

  const POINTS_HISTORY_DATA = [
    { name: 'ม.ค.', earned: 120, used: 0 },
    { name: 'ก.พ.', earned: 85, used: 50 },
    { name: 'มี.ค.', earned: 230, used: 100 },
    { name: 'เม.ย.', earned: 150, used: 20 },
    { name: 'พ.ค.', earned: 310, used: 150 },
    { name: 'มิ.ย.', earned: 185, used: 80 },
  ]

  const spendingChartConfig = {
    total: {
      label: 'ยอดซื้อรวม',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig

  const pointsChartConfig = {
    earned: {
      label: 'แต้มที่ได้รับ',
      color: 'hsl(var(--chart-1))',
    },
    used: {
      label: 'แต้มที่ใช้ไป',
      color: 'hsl(var(--chart-2))',
    },
  } satisfies ChartConfig

  const STATS_DATA = [
    {
      title: 'ยอดซื้อสะสม (ร้านนี้)',
      value: 10800.0,
      description: 'ยอดรวมจากการสั่งซื้อสำเร็จทั้งหมด',
      icon: CreditCard,
      isCurrency: true,
    },
    {
      title: 'แต้มสะสมคงเหลือ',
      value: 595,
      description: 'สามารถใช้เป็นส่วนลดในออเดอร์ถัดไป',
      icon: Award,
      isCurrency: false,
      isPoints: true,
    },
    {
      title: 'คำสั่งซื้อทั้งหมดของคุณ',
      value: 12,
      description: 'รอดำเนินการ 1 รายการ',
      icon: ShoppingBag,
      isCurrency: false,
    },
    {
      title: 'คูปองที่ใช้ได้',
      value: 4,
      description: 'มีคูปองลดแรงสัปดาห์นี้',
      icon: Ticket,
      isCurrency: false,
      isCoupon: true,
    },
  ]

  return (
    <DashboardSidebar redirectPath="user" items={BUYER_NAVIGATION}>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS_DATA.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={
              stat.isCurrency
                ? formatCurrency(stat.value)
                : stat.isPoints
                  ? `${formatNumber(stat.value)} แต้ม`
                  : stat.isCoupon
                    ? `${formatNumber(stat.value)} ใบ`
                    : formatNumber(stat.value)
            }
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>ประวัติการใช้จ่ายของคุณ</CardTitle>
            <CardDescription>
              แสดงยอดสรุปการซื้อสินค้าของคุณในรอบ 6 เดือนที่ผ่านมา
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={spendingChartConfig}>
              <AreaChart
                accessibilityLayer
                data={SPENDING_DATA}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(value) => formatCurrency(value)}
                  width={60}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="line" />}
                />
                <Area
                  dataKey="total"
                  type="natural"
                  fill="var(--color-total)"
                  fillOpacity={0.4}
                  stroke="var(--color-total)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 leading-none font-medium">
                  คุณมียอดซื้อเพิ่มขึ้นในเดือนที่ผ่านมา{' '}
                  <TrendingUp className="size-4" />
                </div>
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                  มกราคม - มิถุนายน 2024
                </div>
              </div>
            </div>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>ความเคลื่อนไหวของแต้มสะสม</CardTitle>
            <CardDescription>
              เปรียบเทียบแต้มที่คุณได้รับและแต้มที่ใช้ไปในแต่ละเดือน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={pointsChartConfig}>
              <AreaChart
                accessibilityLayer
                data={POINTS_HISTORY_DATA}
                margin={{
                  left: 12,
                  right: 12,
                }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="name"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  stroke="#888888"
                  fontSize={12}
                  tickFormatter={(value) => `${formatNumber(value)} P`}
                  width={50}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />
                <Area
                  dataKey="earned"
                  type="monotone"
                  fill="var(--color-earned)"
                  fillOpacity={0.3}
                  stroke="var(--color-earned)"
                  strokeWidth={2}
                />
                <Area
                  dataKey="used"
                  type="monotone"
                  fill="var(--color-used)"
                  fillOpacity={0.2}
                  stroke="var(--color-used)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-3">
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-1">
                <div className="flex items-center gap-2 leading-none font-medium">
                  สะสมแต้มให้ครบเพื่อแลกรับส่วนลดพิเศษในออเดอร์ถัดไป
                </div>
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                  มกราคม - มิถุนายน 2024
                </div>
              </div>
            </div>
            <div className="text-muted-foreground flex w-full flex-wrap items-center gap-4 border-t pt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="shrink-0 rounded-md border border-green-200 bg-green-50 p-1 text-green-600">
                  <IconArrowDownLeft size={14} />
                </div>
                <span>แต้มที่ได้รับ (Earned)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="shrink-0 rounded-md border bg-red-50 p-1 text-red-500 not-first:border-red-200">
                  <IconArrowUpRight size={14} />
                </div>
                <span>แต้มที่ใช้ (Used)</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardSidebar>
  )
}
