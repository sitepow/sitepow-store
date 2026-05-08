'use client'

import Link from 'next/link'

import { formatCurrency, formatNumber } from '@/utils/pricing'
import {
  AlertCircleIcon,
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
  User2,
  Users,
} from 'lucide-react'
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
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
import { Progress } from '@/components/ui/progress'
import { Table, TableBody, TableCell, TableRow } from '@/components/ui/table'

import { cn } from '@/lib/utils'

import { DashboardHeader } from '../../_components/DashboardHeader'
import { StatsCard } from '../../_components/StatsCard'
import { StoreAdminLayout } from '../../_components/layout/admin/Layout'

const SALES_DATA = [
  { name: 'ม.ค.', total: 4500 },
  { name: 'ก.พ.', total: 5200 },
  { name: 'มี.ค.', total: 4800 },
  { name: 'เม.ย.', total: 6100 },
  { name: 'พ.ค.', total: 5900 },
  { name: 'มิ.ย.', total: 7200 },
]

const chartConfig = {
  total: {
    label: 'ยอดขาย',
    color: 'hsl(var(--primary))',
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

const RECENT_SALES = [
  {
    id: 1,
    name: 'สมชาย รักดี',
    email: 'somchai.r@email.com',
    amount: 1999,
  },
  {
    id: 2,
    name: 'วิภาดา สายชล',
    email: 'wipada.s@email.com',
    amount: 2500.5,
  },
  {
    id: 3,
    name: 'ธนกฤต มั่งมี',
    email: 'tanakrit.m@email.com',
    amount: 850,
  },
  {
    id: 4,
    name: 'ปิยะนุช สดใส',
    email: 'piyanut.s@email.com',
    amount: 4200,
  },
  {
    id: 5,
    name: 'อานนท์ บุญส่ง',
    email: 'arnon.b@email.com',
    amount: 1150.25,
  },
]

const LOW_STOCK_PRODUCTS = [
  {
    id: 'PROD-003',
    name: 'กระเป๋าผ้า Canvas Eco',
    inventory: [
      { branchName: 'สาขาสยาม', stock: 0 },
      { branchName: 'ออนไลน์', stock: 2 },
    ],
  },
  {
    id: 'PROD-004',
    name: 'หมวกแก๊ปสีดำ Basic',
    inventory: [{ branchName: 'สาขาสยาม', stock: 3 }],
  },
]

export default function StoreAdminDashboardPage() {
  return (
    <StoreAdminLayout>
      <div className="container space-y-8 py-10">
        <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-12">
          <DashboardHeader
            className="xl:col-span-8"
            title="ภาพรวมร้านค้า"
            description="ยินดีต้อนรับกลับมา! นี่คือรายงานสรุปผลการดำเนินงานของร้านคุณ"
          />

          <Card className="xl:col-span-4">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-muted-foreground text-xs font-medium tracking-wider uppercase">
                    แพ็กเกจปัจจุบัน
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xl font-bold">Pro Package</span>
                    <Badge variant="secondary">กำลังใช้งาน</Badge>
                    <Badge variant="secondary">เปิดใช้งาน EasySlip</Badge>
                  </div>
                </div>
              </div>

              <div className="space-y-3 border-t pt-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      AI Vision (Quota)
                    </span>
                    <span className="font-medium">45 / 100</span>
                  </div>
                  <Progress value={45} className="h-1" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">
                      AI Search (Quota)
                    </span>
                    <span className="font-medium">12 / 100</span>
                  </div>
                  <Progress value={12} className="h-1" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full">เปลี่ยนแพ็คเกจ</Button>
            </CardFooter>
          </Card>
        </div>

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

        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
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

          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>รายการขายล่าสุด</CardTitle>
              <CardDescription>
                คุณมียอดขาย 265 รายการในเดือนนี้
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {RECENT_SALES.map((sale) => (
                  <div key={sale.id} className="flex items-center">
                    <Avatar className="size-8 border">
                      <AvatarImage src="" />
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
            </CardContent>
          </Card>

          <Card className="lg:col-span-3">
            <CardHeader>
              <div className="flex flex-wrap justify-between gap-2.5">
                <CardTitle>สินค้าใกล้หมด</CardTitle>
                <Badge variant="destructive">
                  <AlertCircleIcon />
                  {LOW_STOCK_PRODUCTS.length} รายการ
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableBody>
                  {LOW_STOCK_PRODUCTS.map((product) => (
                    <TableRow key={product.id} className="hover:bg-transparent">
                      <TableCell className="px-0 py-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <p className="text-sm leading-none font-medium">
                              {product.name}
                            </p>
                            <p className="text-muted-foreground text-[10px]">
                              {product.id}
                            </p>
                          </div>
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
                                  className={cn(
                                    'font-bold',
                                    inv.stock === 0
                                      ? 'text-destructive'
                                      : 'text-foreground',
                                  )}
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
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full text-xs" asChild>
                <Link href="/admin/products">ดูคลังสินค้าทั้งหมด</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </StoreAdminLayout>
  )
}
