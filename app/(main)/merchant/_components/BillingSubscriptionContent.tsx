'use client'

import { useState } from 'react'

import {
  IconAlertTriangle,
  IconBuildingStore,
  IconCalendarEvent,
  IconCircleCheck,
  IconDownload,
  IconReceipt2,
} from '@tabler/icons-react'
import { Receipt } from 'lucide-react'

import { PageTabHeader } from '@/components/PageTabHeader'
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type PlanType = 'STARTER' | 'PRO' | 'ULTIMATE'
type SubStatusType = 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'

interface PlanDetails {
  name: string
  price: number
  features: string[]
}

const PLAN_DETAILS: Record<PlanType, PlanDetails> = {
  STARTER: {
    name: 'Starter Plan',
    price: 0,
    features: ['ลงสินค้าได้จำกัด', 'ไม่มีระบบ AI'],
  },
  PRO: {
    name: 'Pro Plan',
    price: 490,
    features: ['เพิ่มจำนวนสินค้า', 'ระบบ Easy Slip', 'AI Vision พื้นฐาน'],
  },
  ULTIMATE: {
    name: 'Ultimate Plan',
    price: 1290,
    features: ['ทุกอย่าง Unlimited', 'ระบบ AI ครบวงจร', 'ระบบ CRM'],
  },
}

const MOCK_USER_STORES = [
  {
    id: 'store-1',
    name: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    plan: 'PRO' as PlanType,
    status: 'ACTIVE' as SubStatusType,
    isTrial: true,
    daysRemaining: 8,
    totalDays: 14,
    nextBilling: '15 เม.ย. 2026',
  },
  {
    id: 'store-2',
    name: 'ร้านกาแฟหอมกรุ่น Cafe & Bakery',
    plan: 'STARTER' as PlanType,
    status: 'ACTIVE' as SubStatusType,
    isTrial: false,
    daysRemaining: 0,
    totalDays: 0,
    nextBilling: 'ฟรีตลอดชีพ',
  },
  {
    id: 'store-3',
    name: 'Gadget & IT Accessories',
    plan: 'ULTIMATE' as PlanType,
    status: 'PAST_DUE' as SubStatusType,
    isTrial: false,
    daysRemaining: 3,
    totalDays: 7,
    nextBilling: '02 พ.ค. 2026 (ค้างชำระ)',
  },
]

const MOCK_INVOICES = [
  {
    id: 'INV-2026-003',
    date: '2026-03-15',
    amount: 490,
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    plan: 'Pro Plan',
    status: 'PAID',
  },
  {
    id: 'INV-2026-002',
    date: '2026-03-02',
    amount: 1290,
    storeName: 'Gadget & IT Accessories',
    plan: 'Ultimate Plan',
    status: 'PAID',
  },
  {
    id: 'INV-2026-001',
    date: '2026-02-15',
    amount: 490,
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    plan: 'Pro Plan',
    status: 'PAID',
  },
]

export function BillingSubscriptionContent() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>('all')

  const filteredStores =
    selectedStoreId === 'all'
      ? MOCK_USER_STORES
      : MOCK_USER_STORES.filter((s) => s.id === selectedStoreId)

  const filteredInvoices =
    selectedStoreId === 'all'
      ? MOCK_INVOICES
      : MOCK_INVOICES.filter(
          (inv) =>
            inv.storeName ===
            MOCK_USER_STORES.find((s) => s.id === selectedStoreId)?.name,
        )

  return (
    <div className="space-y-6">
      <PageTabHeader
        icon={Receipt}
        title="การจัดการสมาชิกและค่าบริการ"
        description="ตรวจสอบข้อมูลแพลนรายเดือนและประวัติใบเสร็จแยกตามรายร้านค้าของคุณ"
        endContent={
          <div className="flex w-full sm:w-auto sm:items-center sm:justify-end">
            <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="เลือกดูทุกร้านค้า" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  ทุกร้านค้า ({MOCK_USER_STORES.length})
                </SelectItem>
                {MOCK_USER_STORES.map((store) => (
                  <SelectItem key={store.id} value={store.id}>
                    {store.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        }
      />

      <div className="space-y-3">
        <div className="flex items-center gap-2 px-0.5">
          <IconBuildingStore size={16} className="text-muted-foreground" />
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            แพลนบริการปัจจุบัน
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {filteredStores.map((store) => {
            const plan = PLAN_DETAILS[store.plan]
            const isPastDue = store.status === 'PAST_DUE'

            const progressValue =
              store.totalDays > 0
                ? (store.daysRemaining / store.totalDays) * 100
                : 0

            return (
              <Card
                key={store.id}
                className={`group hover:border-input overflow-hidden border-solid transition-all duration-200 ${
                  isPastDue
                    ? 'border-destructive/60 ring-destructive/30 ring-1'
                    : ''
                }`}
              >
                <CardHeader className="p-4 pb-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <CardTitle className="text-foreground group-hover:text-primary text-sm font-semibold tracking-tight transition-colors">
                          {store.name}
                        </CardTitle>
                        {store.isTrial && (
                          <Badge
                            variant="secondary"
                            className="border-none bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600 shadow-none select-none dark:bg-amber-500/20 dark:text-amber-400"
                          >
                            ทดลองใช้ฟรี
                          </Badge>
                        )}
                        {isPastDue && (
                          <Badge
                            variant="destructive"
                            className="animate-pulse px-2 py-0.5 text-[10px] font-medium shadow-none select-none"
                          >
                            เกินกำหนดชำระ
                          </Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        แพลนใช้งานปัจจุบัน:{' '}
                        <span className="text-foreground font-medium">
                          {plan.name}
                        </span>
                      </CardDescription>
                    </div>

                    <div className="text-left sm:text-right">
                      <div className="text-foreground text-base font-bold">
                        {plan.price > 0
                          ? `฿${plan.price.toLocaleString()}`
                          : 'ฟรี'}
                        {plan.price > 0 && (
                          <span className="text-muted-foreground ml-0.5 text-[10px] font-normal">
                            /เดือน
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="bg-muted/30 grid gap-4 border-t border-b p-4 sm:grid-cols-3">
                  <div className="space-y-0.5">
                    <span className="text-muted-foreground text-[11px] font-medium">
                      รอบชำระถัดไป
                    </span>
                    <div className="flex items-center gap-1.5 text-xs font-medium">
                      <IconCalendarEvent
                        size={14}
                        className="text-muted-foreground shrink-0"
                      />
                      <span
                        className={
                          isPastDue
                            ? 'text-destructive font-semibold'
                            : 'text-foreground'
                        }
                      >
                        {store.nextBilling}
                      </span>
                    </div>
                  </div>

                  {(store.isTrial || isPastDue) && (
                    <div className="space-y-1.5 sm:col-span-2">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <IconAlertTriangle
                            size={14}
                            className={
                              isPastDue ? 'text-destructive' : 'text-amber-500'
                            }
                          />
                          {isPastDue
                            ? 'ระยะเวลาผ่อนผันคงเหลือ'
                            : 'ระยะเวลาทดลองใช้คงเหลือ'}
                        </span>
                        <span
                          className={
                            isPastDue
                              ? 'text-destructive font-bold'
                              : 'font-bold text-amber-600 dark:text-amber-400'
                          }
                        >
                          {store.daysRemaining} วัน{' '}
                          <span className="font-normal opacity-70">
                            (จาก {store.totalDays} วัน)
                          </span>
                        </span>
                      </div>
                      <Progress value={progressValue} className="h-1" />
                    </div>
                  )}
                </CardContent>

                <CardFooter className="bg-muted/10 flex flex-wrap items-center justify-between gap-2 p-3 py-2">
                  <span className="text-muted-foreground hidden text-[11px] md:inline-block">
                    ฟีเจอร์เด่นแพลนนี้: {plan.features.slice(0, 2).join(', ')}
                  </span>

                  <div className="ml-auto flex w-full justify-end gap-2 sm:w-auto">
                    {store.plan !== 'STARTER' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 px-2.5 text-[11px] font-medium"
                      >
                        ยกเลิกบริการ
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant={isPastDue ? 'default' : 'outline'}
                      className="h-7 px-3 text-[11px] font-medium"
                    >
                      {isPastDue ? 'ชำระเงินด่วน' : 'เปลี่ยนแพลนใช้งาน'}
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 px-0.5">
          <IconReceipt2 className="text-muted-foreground" size={16} />
          <h2 className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
            ประวัติการชำระเงิน
          </h2>
        </div>

        <div className="bg-background overflow-hidden rounded-xl border border-solid shadow-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="h-9 w-28 text-xs font-medium">
                    เลขที่ใบเสร็จ
                  </TableHead>
                  <TableHead className="h-9 min-w-45 text-xs font-medium">
                    สำหรับร้านค้า
                  </TableHead>
                  <TableHead className="h-9 text-xs font-medium">
                    แพลน
                  </TableHead>
                  <TableHead className="h-9 text-xs font-medium">
                    วันที่ชำระ
                  </TableHead>
                  <TableHead className="h-9 text-xs font-medium">
                    ยอดชำระ
                  </TableHead>
                  <TableHead className="h-9 text-xs font-medium">
                    สถานะ
                  </TableHead>
                  <TableHead className="h-9 w-12 text-right font-medium"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-muted-foreground h-20 text-center text-[11px]"
                    >
                      ไม่พบประวัติการชำระเงินของร้านค้าที่คุณเลือก
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredInvoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="hover:bg-muted/20 border-solid"
                    >
                      <TableCell className="text-foreground font-mono text-xs font-medium">
                        {invoice.id}
                      </TableCell>
                      <TableCell className="text-foreground/90 max-w-60 truncate text-xs font-medium">
                        {invoice.storeName}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {invoice.plan}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-xs">
                        {invoice.date}
                      </TableCell>
                      <TableCell className="text-foreground text-xs font-semibold">
                        ฿{invoice.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className="gap-1 border-none bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 shadow-none select-none dark:bg-emerald-500/20 dark:text-emerald-400"
                        >
                          <IconCircleCheck size={12} className="shrink-0" />{' '}
                          ชำระแล้ว
                        </Badge>
                      </TableCell>
                      <TableCell className="p-2 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-foreground h-7 w-7 rounded"
                          title="ดาวน์โหลด PDF"
                        >
                          <IconDownload size={13} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </div>
  )
}
