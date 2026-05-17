'use client'

import { useState } from 'react'

import {
  IconCoin,
  IconDeviceFloppy,
  IconHistory,
  IconSearch,
  IconSettings,
  IconUsers,
} from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const MOCK_LOYALTY_SETTINGS = {
  'store-1': {
    isEnabled: true,
    earnRate: 100,
    rewardValue: 1,
    minRedeemPoints: 10,
  },
  'store-2': {
    isEnabled: false,
    earnRate: 50,
    rewardValue: 1,
    minRedeemPoints: 20,
  },
  'store-3': {
    isEnabled: true,
    earnRate: 20,
    rewardValue: 1,
    minRedeemPoints: 50,
  },
}

const MOCK_CUSTOMER_POINTS: Record<
  string,
  Array<{
    id: string
    name: string
    phone: string
    currentPoints: number
    totalEarned: number
    lastActive: string
  }>
> = {
  'store-1': [
    {
      id: 'CUST-01',
      name: 'คุณสมชาย ใจดี',
      phone: '081-234-5678',
      currentPoints: 150,
      totalEarned: 450,
      lastActive: '2026-05-16',
    },
    {
      id: 'CUST-02',
      name: 'คุณวรรณา รักเรียน',
      phone: '089-876-5432',
      currentPoints: 45,
      totalEarned: 120,
      lastActive: '2026-05-15',
    },
    {
      id: 'CUST-03',
      name: 'คุณจอนห์น โด',
      phone: '095-111-2222',
      currentPoints: 8,
      totalEarned: 580,
      lastActive: '2026-05-10',
    },
  ],
  'store-2': [],
  'store-3': [
    {
      id: 'CUST-04',
      name: 'คุณสมศักดิ์ สายไอที',
      phone: '082-999-8888',
      currentPoints: 1250,
      totalEarned: 3500,
      lastActive: '2026-05-17',
    },
  ],
}

export function LoyaltyContent() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('store-1')
  const [searchTerm, setSearchTerm] = useState('')

  const [settings, setSettings] = useState(MOCK_LOYALTY_SETTINGS)

  const currentStoreSettings =
    settings[selectedStoreId as keyof typeof settings]
  const currentStoreCustomers = MOCK_CUSTOMER_POINTS[selectedStoreId] || []

  const handleToggleLoyalty = (checked: boolean) => {
    setSettings({
      ...settings,
      [selectedStoreId]: { ...currentStoreSettings, isEnabled: checked },
    })
  }

  const handleInputChange = (field: string, value: number) => {
    setSettings({
      ...settings,
      [selectedStoreId]: { ...currentStoreSettings, [field]: value },
    })
  }

  const filteredCustomers = currentStoreCustomers.filter(
    (customer) =>
      customer.name.includes(searchTerm) || customer.phone.includes(searchTerm),
  )

  return (
    <div className="space-y-8">
      <PageTabHeader
        icon={IconCoin}
        title="ระบบแต้มสะสม"
        description="ตั้งค่าเงื่อนไขการแจกแต้ม และบริหารจัดการคะแนนสมาชิกของแต่ละร้านค้า"
        endContent={
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger className="w-full md:w-70">
              <SelectValue placeholder="เลือกร้านค้า" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="store-1">
                เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล
              </SelectItem>
              <SelectItem value="store-2">
                ร้านกาแฟหอมกรุ่น Cafe & Bakery
              </SelectItem>
              <SelectItem value="store-3">Gadget & IT Accessories</SelectItem>
            </SelectContent>
          </Select>
        }
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="h-fit lg:col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-sm font-bold">
                <IconSettings size={18} className="text-muted-foreground" />
                เงื่อนไขการคำนวณแต้ม
              </CardTitle>
              <Switch
                checked={currentStoreSettings?.isEnabled}
                onCheckedChange={handleToggleLoyalty}
              />
            </div>
            <CardDescription>
              เปิดใช้ระบบคะแนนสะสมและกำหนดสัดส่วนมูลค่าเงินเป็นคะแนน
            </CardDescription>
          </CardHeader>

          <CardContent
            className={`space-y-5 transition-opacity duration-200 ${!currentStoreSettings?.isEnabled ? 'pointer-events-none opacity-40 select-none' : ''}`}
          >
            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                ยอดซื้อขั้นต่ำต่อการรับ 1 แต้ม
              </Label>
              <div className="flex items-center">
                <Input
                  type="number"
                  value={currentStoreSettings?.earnRate || ''}
                  onChange={(e) =>
                    handleInputChange('earnRate', Number(e.target.value))
                  }
                  className="rounded-r-none"
                />
                <span className="bg-muted text-muted-foreground rounded-r-md border border-l-0 px-3 py-2.5 text-xs whitespace-nowrap">
                  บาท = 1 แต้ม
                </span>
              </div>
              <p className="text-muted-foreground text-[10px]">
                เช่น ซื้อครบ 100 บาท ระบบจะคำนวณให้ 1 คะแนนเข้าสู่บัญชีลูกค้า
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                มูลค่าส่วนลดต่อ 1 แต้ม
              </Label>
              <div className="flex items-center">
                <Input
                  type="number"
                  value={currentStoreSettings?.rewardValue || ''}
                  onChange={(e) =>
                    handleInputChange('rewardValue', Number(e.target.value))
                  }
                  className="rounded-r-none"
                />
                <span className="bg-muted text-muted-foreground rounded-r-md border border-l-0 px-3 py-2.5 text-xs whitespace-nowrap">
                  แต้ม = ลด 1 บาท
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold">
                จำนวนแต้มขั้นต่ำที่สามารถแลกได้
              </Label>
              <div className="flex items-center">
                <Input
                  type="number"
                  value={currentStoreSettings?.minRedeemPoints || ''}
                  onChange={(e) =>
                    handleInputChange('minRedeemPoints', Number(e.target.value))
                  }
                  className="rounded-r-none"
                />
                <span className="bg-muted text-muted-foreground rounded-r-md border border-l-0 px-3 py-2.5 text-xs whitespace-nowrap">
                  แต้มขึ้นไป
                </span>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end border-t pt-3">
            <Button
              size="sm"
              className="gap-1.5 text-xs"
              disabled={!currentStoreSettings?.isEnabled}
            >
              <IconDeviceFloppy size={14} /> บันทึกการตั้งค่า
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-bold">
              <IconUsers size={18} className="text-muted-foreground" />
              ฐานข้อมูลสมาชิกและคะแนนคงเหลือ
            </CardTitle>
            <CardDescription>
              รายชื่อลูกค้าที่เป็นสมาชิกของร้านค้านี้ และประวัติคะแนนสะสม
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="relative">
              <IconSearch
                className="text-muted-foreground absolute top-2.5 left-2.5"
                size={16}
              />
              <Input
                placeholder="ค้นหาสมาชิกด้วยชื่อ หรือเบอร์โทรศัพท์..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 text-xs"
                disabled={!currentStoreSettings?.isEnabled}
              />
            </div>

            <div className="bg-background overflow-hidden rounded-xl border">
              <Table>
                <TableHeader className="bg-muted/40 text-xs">
                  <TableRow>
                    <TableHead>รหัสสมาชิก</TableHead>
                    <TableHead>ชื่อลูกค้า</TableHead>
                    <TableHead>เบอร์โทรศัพท์</TableHead>
                    <TableHead className="text-right">แต้มปัจจุบัน</TableHead>
                    <TableHead className="text-right">
                      แต้มสะสมทั้งหมด
                    </TableHead>
                    <TableHead className="text-right">จัดการ</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {!currentStoreSettings?.isEnabled ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-muted-foreground py-8 text-center text-xs"
                      >
                        ระบบแต้มสะสมของร้านค้านี้ถูกปิดการใช้งานอยู่
                      </TableCell>
                    </TableRow>
                  ) : filteredCustomers.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-muted-foreground py-8 text-center text-xs"
                      >
                        ไม่พบข้อมูลสมาชิกในระบบของแบรนด์นี้
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCustomers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-mono text-xs font-bold">
                          {customer.id}
                        </TableCell>
                        <TableCell className="text-xs font-semibold">
                          {customer.name}
                        </TableCell>
                        <TableCell className="text-muted-foreground font-mono text-xs">
                          {customer.phone}
                        </TableCell>
                        <TableCell className="text-right text-xs font-black text-amber-600">
                          {customer.currentPoints.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-right text-xs">
                          {customer.totalEarned.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="hover:text-primary h-7 gap-1 text-[11px]"
                          >
                            <IconHistory size={12} /> ประวัติการใช้
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
