'use client'

import {
  CreditCard,
  DollarSign,
  Package,
  TrendingUp,
  Users,
} from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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
import { Progress } from '@/components/ui/progress'

import { DashboardHeader } from '../../_components/DashboardHeader'
import { StatsCard } from '../../_components/StatsCard'
import { StoreAdminLayout } from '../../_components/layout/admin/Layout'

const salesData = [
  { name: 'ม.ค.', total: 4500 },
  { name: 'ก.พ.', total: 5200 },
  { name: 'มี.ค.', total: 4800 },
  { name: 'เม.ย.', total: 6100 },
  { name: 'พ.ค.', total: 5900 },
  { name: 'มิ.ย.', total: 7200 },
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
          <StatsCard
            title="รายได้ทั้งหมด"
            value="฿45,231.89"
            description="+20.1% จากเดือนที่แล้ว"
            icon={DollarSign}
          />
          <StatsCard
            title="คำสั่งซื้อ"
            value="+2350"
            description="+180.1% จากเดือนที่แล้ว"
            icon={Package}
          />
          <StatsCard
            title="ยอดขายรายวัน"
            value="+12,234"
            description="+19% จากเมื่อวาน"
            icon={CreditCard}
          />
          <StatsCard
            title="ลูกค้าใหม่"
            value="+573"
            description="+201 คน ตั้งแต่ชั่วโมงที่แล้ว"
            icon={Users}
          />
        </div>

        <div className="grid gap-4 lg:grid-cols-7">
          <Card className="lg:col-span-4">
            <CardHeader>
              <CardTitle>แนวโน้มยอดขาย</CardTitle>
              <CardDescription>
                แสดงยอดขายสุทธิในรอบ 6 เดือนที่ผ่านมา
              </CardDescription>
            </CardHeader>
            <CardContent className="pl-2">
              <div className="h-87.5 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#e5e7eb"
                    />
                    <XAxis
                      dataKey="name"
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="#888888"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `฿${value}`}
                    />
                    <Tooltip
                      cursor={{ fill: '#f3f4f6' }}
                      contentStyle={{
                        borderRadius: '8px',
                        border: '1px solid #e5e7eb',
                      }}
                    />
                    <Bar
                      dataKey="total"
                      fill="currentColor"
                      radius={[4, 4, 0, 0]}
                      className="fill-primary"
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
            <CardFooter className="flex-col items-start gap-2 text-sm">
              <div className="flex gap-2 leading-none font-medium">
                ยอดขายพุ่งสูงขึ้น 5.2% ในเดือนนี้{' '}
                <TrendingUp className="size-4" />
              </div>
              <div className="text-muted-foreground leading-none">
                แสดงข้อมูลสรุปรายได้จากการขายจริง
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
                {[1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="flex items-center">
                    <div className="bg-muted flex size-9 items-center justify-center rounded-full text-xs font-medium">
                      US
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="text-sm leading-none font-medium">
                        ลูกค้าทั่วไป #{item}
                      </p>
                      <p className="text-muted-foreground text-sm">
                        customer{item}@email.com
                      </p>
                    </div>
                    <div className="ml-auto font-medium">+฿1,999.00</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </StoreAdminLayout>
  )
}
