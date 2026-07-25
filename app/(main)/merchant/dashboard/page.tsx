'use client'

import Link from 'next/link'

import { useDashboard } from '@/actions/hooks/dashboard'
import { useEmployeePermission } from '@/actions/hooks/employee'
import { StatsCard } from '@/app/sites/[domain]/_components/StatsCard'
import { MERCHANT_NAVIGATION } from '@/constants/navigation'
import { useBranchFilter } from '@/stores/use-branch-filter'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatCurrency, formatNumber } from '@/utils/pricing'
import { IconExternalLink } from '@tabler/icons-react'
import {
  ArrowRight,
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
  User2,
  Users,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { ActionRequiredAlert } from '@/components/ActionRequiredAlert'
import { BranchSelectField } from '@/components/BranchSelectField'
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
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { StoreCreditCard } from '../credits/_components/StoreCreditCard'

function pctChange(current: number, previous: number): string {
  if (previous === 0 && current === 0) {
    return '0% จากเดือนที่แล้ว'
  }
  if (previous === 0) {
    return '+100% จากเดือนที่แล้ว'
  }
  const pct = ((current - previous) / previous) * 100
  return `${pct >= 0 ? '+' : ''}${pct.toFixed(1)}% จากเดือนที่แล้ว`
}

const chartConfig = {
  total: { label: 'ยอดขาย', color: 'hsl(var(--primary))' },
} satisfies ChartConfig

export default function MerchantDashboardPage() {
  const { selectedStoreId, selectedStoreSlug } = useStoreFilter()
  const { selectedBranchId } = useBranchFilter()

  const {
    canViewDashboard,
    canViewCreditCard,
    isLoading: isPermissionLoading,
  } = useEmployeePermission()

  const { data, isLoading } = useDashboard(selectedStoreId, selectedBranchId)

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
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <StoreSelectField />
          <BranchSelectField />
        </div>
        {selectedStoreId !== ALL_STORES && (
          <div className="flex flex-wrap gap-2.5">
            <Button variant="outline" asChild>
              <Link href="/merchant/settings" target="_blank">
                ตั้งค่าร้านค้า <IconExternalLink />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                href={`https://${selectedStoreSlug}.sitepow.store`}
                target="_blank"
              >
                ดูหน้าร้านออนไลน์ของคุณ <IconExternalLink />
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link
                href={`https://${selectedStoreSlug}.sitepow.store/pos`}
                target="_blank"
              >
                เข้าระบบ POS ขายหน้าร้าน <IconExternalLink />
              </Link>
            </Button>
          </div>
        )}
      </div>
      {selectedStoreId === ALL_STORES && <ActionRequiredAlert />}
      {selectedStoreId !== ALL_STORES && (isPermissionLoading || isLoading) && (
        <div className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-28" />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      )}
      {selectedStoreId !== ALL_STORES &&
        !isPermissionLoading &&
        canViewDashboard === false && (
          <ActionRequiredAlert
            title="ไม่มีสิทธิ์เข้าถึง"
            description="คุณไม่มีสิทธิ์ในการดูข้อมูลแดชบอร์ดของสาขาหรือร้านค้านี้"
          />
        )}
      {selectedStoreId !== ALL_STORES &&
        !isPermissionLoading &&
        canViewDashboard !== false &&
        !isLoading &&
        data && (
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
            {canViewCreditCard && <StoreCreditCard />}
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
                  <CardTitle>รายการขายล่าสุด</CardTitle>
                  <CardDescription>5 ออเดอร์ล่าสุดของสาขานี้</CardDescription>
                </CardHeader>
                <CardContent>
                  {(data?.recentSales ?? []).length === 0 ? (
                    <ActionRequiredAlert
                      title="แจ้งเตือน"
                      description="ขณะนี้ยังไม่มียอดขายล่าสุดในสาขานี้"
                    />
                  ) : (
                    <div className="space-y-8">
                      {(data?.recentSales ?? []).map((sale) => (
                        <div key={sale.id} className="flex items-center">
                          <Avatar className="size-8 border">
                            <AvatarFallback>
                              <User2 size={16} />
                            </AvatarFallback>
                          </Avatar>
                          <div className="ml-4 max-w-72 space-y-1 wrap-break-word whitespace-pre-line">
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
                  <CardTitle>สินค้าใกล้หมด</CardTitle>
                  <CardDescription>
                    รายการสินค้าที่ต้องเติมสต็อกด่วน
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {(data?.lowStock ?? []).length === 0 ? (
                    <ActionRequiredAlert
                      title="แจ้งเตือน"
                      description="ขณะนี้ยังไม่มีสินค้าที่ใกล้หมด"
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableCell className="font-medium">
                            สินค้า / รหัสตัวเลือก / ชื่อตัวเลือก
                          </TableCell>
                          <TableCell className="font-medium">สาขา</TableCell>
                          <TableCell className="text-right font-medium">
                            คงเหลือ
                          </TableCell>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {(data?.lowStock ?? []).map((item) => (
                          <TableRow key={item.id}>
                            <TableCell className="max-w-72 min-w-72 py-3 wrap-break-word whitespace-pre-line">
                              <div className="space-y-0.5">
                                <p className="text-sm font-medium">
                                  {item.productName}
                                </p>
                                {item.variantId && (
                                  <span className="text-muted-foreground text-xs">
                                    ({item.variantId})
                                    <br />
                                  </span>
                                )}
                                {item.variantTitle && (
                                  <span className="text-muted-foreground text-xs">
                                    ({item.variantTitle})
                                  </span>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="py-3">
                              <Badge
                                variant="outline"
                                className="text-muted-foreground"
                              >
                                {item.branchName}
                              </Badge>
                            </TableCell>
                            <TableCell className="py-3 text-right">
                              <span
                                className={`font-bold ${
                                  item.stock === 0
                                    ? 'text-destructive'
                                    : 'text-amber-500'
                                }`}
                              >
                                {formatNumber(item.stock)}
                              </span>
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
