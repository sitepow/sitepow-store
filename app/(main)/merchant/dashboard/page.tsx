'use client'

import Link from 'next/link'

import { useDashboard } from '@/actions/hooks/dashboard'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import {
  AlertCircleIcon,
  ArrowRight,
  CreditCard,
  DollarSign,
  Eye,
  Package,
  Search,
  TrendingUp,
  User2,
  Users,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { StoreSelectField } from '@/components/StoreSelectField'
import { DashboardSidebar } from '@/components/layout/DashboardSidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

function pctChange(current: number, previous: number): string {
  if (previous === 0 && current === 0) return '0% จากเดือนที่แล้ว'
  if (previous === 0) return '+100% จากเดือนที่แล้ว'
  const pct = ((current - previous) / previous) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% จากเดือนที่แล้ว`
}

const chartConfig = {
  total: { label: 'ยอดขาย', color: 'hsl(var(--primary))' },
} satisfies ChartConfig

const aiChartConfig = {
  vision: { label: 'AI Vision', color: 'hsl(var(--chart-1))' },
  search: { label: 'AI Search', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig

export default function MerchantDashboardPage() {
  const { selectedStoreId } = useStoreFilter()
  const { data, isLoading } = useDashboard(selectedStoreId as string)

  const stats = data?.stats
  const statsData = stats
    ? [
        {
          title: 'รายได้ทั้งหมด',
          value: formatCurrency(stats.totalRevenue),
          description: pctChange(
            stats.totalRevenue,
            stats.totalRevenueLastMonth,
          ),
          icon: DollarSign,
        },
        {
          title: 'คำสั่งซื้อ',
          value: formatNumber(stats.totalOrders),
          description: pctChange(stats.totalOrders, stats.totalOrdersLastMonth),
          icon: Package,
        },
        {
          title: 'ยอดขายรายวัน',
          value: formatCurrency(stats.dailySales),
          description: pctChange(stats.dailySales, stats.dailySalesYesterday),
          icon: CreditCard,
        },
        {
          title: 'ลูกค้าใหม่',
          value: formatNumber(stats.newCustomers),
          description: pctChange(
            stats.newCustomers,
            stats.newCustomersLastMonth,
          ),
          icon: Users,
        },
      ]
    : []

  return (
    <DashboardSidebar redirectPath="merchant" items={MERCHANT_NAVIGATION}>
      <StoreSelectField />

      {selectedStoreId === ALL_STORES && <ActionRequiredAlert />}
      {selectedStoreId !== ALL_STORES && !isLoading && data && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {statsData.map((stat, i) => (
              <StatsCard
                key={i}
                title={stat.title}
                value={stat.value}
                description={stat.description}
                icon={stat.icon}
              />
            ))}
          </div>

          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>แนวโน้มยอดขาย</CardTitle>
                <CardDescription>ยอดขายสุทธิ 6 เดือนล่าสุด</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig}>
                  <AreaChart
                    data={data?.salesTrend ?? []}
                    margin={{ left: 12, right: 12 }}
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
                      tickFormatter={(v) => formatCurrency(v)}
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
                <div className="flex items-center gap-2 text-sm font-medium">
                  <TrendingUp className="size-4" /> 6 เดือนล่าสุด
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>การใช้งาน AI Credit</CardTitle>
                <CardDescription>
                  เครดิตคงเหลือใน Vision และ Search
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={aiChartConfig}>
                  <AreaChart
                    data={[
                      {
                        name: 'คงเหลือ',
                        vision: data?.aiCreditUsage.vision ?? 0,
                        search: data?.aiCreditUsage.search ?? 0,
                      },
                    ]}
                    margin={{ left: 12, right: 12 }}
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
                      fontSize={12}
                      width={50}
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
                  </AreaChart>
                </ChartContainer>
              </CardContent>
              <CardFooter className="text-muted-foreground flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                  <Eye className="size-3.5" /> AI Vision:{' '}
                  {formatNumber(data?.aiCreditUsage.vision ?? 0)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Search className="size-3.5" /> AI Search:{' '}
                  {formatNumber(data?.aiCreditUsage.search ?? 0)}
                </div>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>รายการขายล่าสุด</CardTitle>
                <CardDescription>5 ออเดอร์ล่าสุดของร้านค้า</CardDescription>
              </CardHeader>
              <CardContent>
                {(data?.recentSales ?? []).length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    ยังไม่มียอดขายล่าสุด
                  </p>
                ) : (
                  <div className="space-y-8">
                    {(data?.recentSales ?? []).map((sale) => (
                      <div key={sale.id} className="flex items-center">
                        <Avatar className="size-8 border">
                          <AvatarFallback>
                            <User2 size={16} />
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-4 space-y-1">
                          <p className="text-sm leading-none font-medium">
                            {sale.name}
                          </p>
                          <p className="text-muted-foreground text-sm">
                            {sale.email}
                          </p>
                        </div>
                        <div className="text-primary ml-auto font-medium">
                          +{formatCurrency(sale.amount)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="h-fit">
              <CardHeader>
                <div className="flex flex-wrap justify-between gap-2.5">
                  <CardTitle>สินค้าใกล้หมด</CardTitle>
                  {(data?.lowStock.length ?? 0) > 0 && (
                    <Badge variant="destructive">
                      <AlertCircleIcon />
                      {data?.lowStock.length} รายการ
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {(data?.lowStock ?? []).length === 0 ? (
                  <p className="text-muted-foreground text-sm">
                    ไม่มีสินค้าใกล้หมด
                  </p>
                ) : (
                  <Table>
                    <TableBody>
                      {(data?.lowStock ?? []).map((product) => (
                        <TableRow
                          key={product.id}
                          className="hover:bg-transparent"
                        >
                          <TableCell className="px-0 py-4">
                            <div className="space-y-2">
                              <p className="text-sm leading-none font-medium">
                                {product.name}
                              </p>
                              <div className="flex flex-wrap gap-1.5">
                                {product.inventory.map((inv, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="outline"
                                    className="px-1.5 py-0 text-[10px] font-normal"
                                  >
                                    <span className="text-muted-foreground mr-1.5 border-r pr-1.5">
                                      {inv.branchName}
                                    </span>
                                    <span
                                      className={
                                        inv.stock === 0
                                          ? 'text-destructive'
                                          : 'text-foreground'
                                      }
                                    >
                                      {formatNumber(inv.stock)}
                                    </span>
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/merchant/inventory">
                    ดูคลังสินค้าทั้งหมด <ArrowRight />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </>
      )}
    </DashboardSidebar>
  )
}
