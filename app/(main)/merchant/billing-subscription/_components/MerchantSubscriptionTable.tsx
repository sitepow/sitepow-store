'use client'

import { IconAlertTriangle } from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
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

export interface UserStoreSubscription {
  id: string
  name: string
  plan: PlanType
  status: SubStatusType
  isTrial: boolean
  daysRemaining: number
  totalDays: number
  nextBilling: string
}

interface MerchantSubscriptionTableProps {
  stores: UserStoreSubscription[]
}

export function MerchantSubscriptionTable({
  stores,
}: MerchantSubscriptionTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ข้อมูลร้านค้า</TableHead>
            <TableHead>แพลนปัจจุบัน</TableHead>
            <TableHead>ค่าบริการ / เดือน</TableHead>
            <TableHead className="max-w-75">สถานะและระยะเวลาคงเหลือ</TableHead>
            <TableHead>รอบชำระถัดไป</TableHead>
            <TableHead className="text-right">จัดการ</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {stores?.length !== 0 &&
            stores.map((store) => {
              const plan = PLAN_DETAILS[store.plan]
              const isPastDue = store.status === 'PAST_DUE'
              const progressValue =
                store.totalDays > 0
                  ? (store.daysRemaining / store.totalDays) * 100
                  : 0

              return (
                <TableRow key={store.id}>
                  <TableCell>
                    <div className="flex flex-col space-y-2">
                      <span className="font-medium">{store.name}</span>
                      <div className="mt-0.5 flex items-center gap-1.5">
                        {store.isTrial && (
                          <Badge variant="secondary">ทดลองใช้ฟรี</Badge>
                        )}
                        {isPastDue && (
                          <Badge variant="destructive">เกินกำหนดชำระ</Badge>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span>{plan.name}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">
                      {plan.price > 0
                        ? `฿${plan.price.toLocaleString()}`
                        : 'ฟรี'}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-75">
                    {store.isTrial || isPastDue ? (
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex items-center gap-1 text-sm">
                          <IconAlertTriangle
                            size={16}
                            className={
                              isPastDue ? 'text-destructive' : 'text-amber-500'
                            }
                          />
                          <span className="text-muted-foreground">
                            {isPastDue
                              ? 'ระยะเวลาผ่อนผันคงเหลือ'
                              : 'ระยะเวลาทดลองใช้คงเหลือ'}
                          </span>
                          <span
                            className={`font-semibold ${isPastDue ? 'text-destructive' : 'text-foreground'}`}
                          >
                            {store.daysRemaining} วัน
                          </span>
                          <span className="text-xs opacity-60">
                            (จาก {store.totalDays} วัน)
                          </span>
                        </div>
                        <Progress value={progressValue} className="h-1" />
                      </div>
                    ) : (
                      <span className="text-sm opacity-60">ปกติ</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span
                      className={
                        isPastDue ? 'text-destructive font-medium' : 'text-sm'
                      }
                    >
                      {store.nextBilling}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {store.plan !== 'STARTER' && (
                        <Button size="sm" variant="link" className="underline">
                          ยกเลิก
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant={isPastDue ? 'default' : 'outline'}
                        className="h-8"
                      >
                        {isPastDue ? 'ชำระเงิน' : 'เปลี่ยนแพลน'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          {stores?.length === 0 && (
            <TableRow>
              <TableCell
                colSpan={6}
                className="text-muted-foreground h-20 text-center text-sm"
              >
                ไม่พบข้อมูลแพลนบริการของร้านค้า
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
