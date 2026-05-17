import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import {
  CreditCard,
  DollarSign,
  Eye,
  FileText,
  Package,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

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

export function DashboardContent() {
  const SALES_DATA = [
    { name: 'ม.ค.', total: 4500 },
    { name: 'ก.พ.', total: 5200 },
    { name: 'มี.ค.', total: 4800 },
    { name: 'เม.ย.', total: 6100 },
    { name: 'พ.ค.', total: 5900 },
    { name: 'มิ.ย.', total: 7200 },
  ]

  const AI_CREDIT_DATA = [
    { name: 'ม.ค.', vision: 45, search: 60, description: 20 },
    { name: 'ก.พ.', vision: 55, search: 72, description: 35 },
    { name: 'มี.ค.', vision: 68, search: 55, description: 40 },
    { name: 'เม.ย.', vision: 85, search: 90, description: 65 },
    { name: 'พ.ค.', vision: 92, search: 110, description: 50 },
    { name: 'มิ.ย.', vision: 120, search: 145, description: 85 },
  ]

  const chartConfig = {
    total: {
      label: 'ยอดขาย',
      color: 'hsl(var(--primary))',
    },
  } satisfies ChartConfig

  const aiChartConfig = {
    vision: {
      label: 'AI Vision (รูปภาพ)',
      color: 'hsl(var(--chart-1))',
    },
    search: {
      label: 'AI Search (ค้นหา)',
      color: 'hsl(var(--chart-2))',
    },
    description: {
      label: 'AI Description (เจนคำอธิบาย)',
      color: 'hsl(var(--chart-3))',
    },
  } satisfies ChartConfig

  const STATS_DATA = [
    {
      title: 'รายได้ทั้งหมด',
      value: 45231.89,
      description: '+20.1% จากเดือนที่แล้ว',
      icon: DollarSign,
      isCurrency: true,
    },
    {
      title: 'คำสั่งซื้อ',
      value: 2350,
      description: '+180.1% จากเดือนที่แล้ว',
      icon: Package,
      isCurrency: false,
    },
    {
      title: 'ยอดขายรายวัน',
      value: 12234,
      description: '+19% จากเมื่อวาน',
      icon: CreditCard,
      isCurrency: false,
    },
    {
      title: 'ลูกค้าใหม่',
      value: 573,
      description: '+201 คน ตั้งแต่ชั่วโมงที่แล้ว',
      icon: Users,
      isCurrency: false,
    },
  ]

  return (
    <div className="col-span-10 space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {STATS_DATA.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={
              stat.isCurrency
                ? formatCurrency(stat.value)
                : `+${formatNumber(stat.value)}`
            }
            description={stat.description}
            icon={stat.icon}
          />
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>แนวโน้มยอดขาย</CardTitle>
            <CardDescription>
              แสดงยอดขายสุทธิในรอบ 6 เดือนที่ผ่านมา
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig}>
              <AreaChart
                accessibilityLayer
                data={SALES_DATA}
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
                  ยอดขายพุ่งสูงขึ้น 5.2% ในเดือนนี้{' '}
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
            <CardTitle>การใช้งาน AI Credit</CardTitle>
            <CardDescription>
              เปรียบเทียบการเรียกใช้งาน AI Vision และ AI Search รายเดือน
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={aiChartConfig}>
              <AreaChart
                accessibilityLayer
                data={AI_CREDIT_DATA}
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
                  tickFormatter={(value) => `${formatNumber(value)} ครั้ง`}
                  width={65}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent indicator="dot" />}
                />

                <Area
                  dataKey="vision"
                  type="monotone"
                  fill="var(--color-vision)"
                  fillOpacity={0.4}
                  stroke="var(--color-vision)"
                  strokeWidth={2}
                />

                <Area
                  dataKey="search"
                  type="monotone"
                  fill="var(--color-search)"
                  fillOpacity={0.3}
                  stroke="var(--color-search)"
                  strokeWidth={2}
                />

                <Area
                  dataKey="description"
                  type="monotone"
                  fill="var(--color-description)"
                  fillOpacity={0.2}
                  stroke="var(--color-description)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter className="flex-col items-start gap-3">
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-1">
                <div className="flex items-center gap-2 leading-none font-medium">
                  อัตราการค้นหาด้วยภาพและข้อความโตขึ้นอย่างต่อเนื่อง
                </div>
                <div className="text-muted-foreground flex items-center gap-2 leading-none">
                  มกราคม - มิถุนายน 2024
                </div>
              </div>
            </div>
            <div className="text-muted-foreground flex w-full flex-wrap items-center gap-4 border-t pt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <Eye className="size-3.5" />
                <span>AI Vision</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Search className="size-3.5" />
                <span>AI Search</span>
              </div>
              <div className="flex items-center gap-1.5">
                <FileText className="size-3.5" />
                <span>AI Description</span>
              </div>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
