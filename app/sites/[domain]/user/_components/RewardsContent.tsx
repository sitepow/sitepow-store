'use client'

import { useState } from 'react'

import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconCoin,
  IconGift,
  IconHistory,
  IconShoppingBag,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const MOCK_TOTAL_POINTS = 450
const MOCK_POINTS_HISTORY = [
  {
    id: 'pt-001',
    type: 'EARN',
    description: 'ได้รับคะแนนจากการสั่งซื้อออเดอร์ ORD-9942',
    storeName: 'เสื้อผ้าแฟชั่นสไตล์เกาหลี มินิมอล',
    points: 49,
    createdAt: '2026-05-17 10:14',
  },
  {
    id: 'pt-002',
    type: 'REDEEM',
    description: 'แลกรับโค้ดส่วนลดท้ายบิลมูลค่า 50 บาท',
    storeName: 'Gadget & IT Accessories',
    points: -100,
    createdAt: '2026-05-16 19:00',
  },
  {
    id: 'pt-003',
    type: 'EARN',
    description: 'คะแนนต้อนรับสมาชิกใหม่ (Welcome Points)',
    storeName: 'sitepow-store (ระบบกลาง)',
    points: 500,
    createdAt: '2026-02-20 14:22',
  },
]

export function RewardsContent() {
  const [totalPoints, setTotalPoints] = useState(MOCK_TOTAL_POINTS)
  const [history, setHistory] = useState(MOCK_POINTS_HISTORY)

  return (
    <div className="space-y-6">
      <PageTabHeader
        icon={IconCoin}
        title="แต้มสะสมของฉัน (Loyalty Points)"
        description="ตรวจสอบคะแนนสะสมทั้งหมด แลกรับของรางวัลพิเศษ
          และดูประวัติแต้มจากการช้อปปิ้งออนไลน์และหน้าร้าน"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="to-background relative flex flex-col justify-between overflow-hidden border-amber-500/20 bg-linear-to-br from-amber-500/10 via-amber-500/2 md:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-1 text-xs font-bold tracking-wider text-amber-600 uppercase">
              <IconCoin size={14} className="text-amber-500" /> คะแนนพร้อมใช้งาน
            </CardDescription>
            <CardTitle className="text-foreground flex items-baseline gap-1 pt-1 text-4xl font-extrabold tracking-tight">
              {totalPoints.toLocaleString()}{' '}
              <span className="text-muted-foreground text-xs font-normal">
                คะแนน
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground pb-4 text-[11px] leading-relaxed">
            คะแนนสะสมไม่มีวันหมดอายุ
            สามารถนำไปใช้แลกรับส่วนลดพิเศษหรือสิทธิประโยชน์เมื่อซื้อสินค้าครั้งถัดไปได้ทันที
          </CardContent>
          <CardFooter className="bg-background/50 border-t pt-3 pb-3">
            <Button
              size="sm"
              variant="outline"
              className="h-8 w-full border-amber-200 text-xs text-amber-700 hover:bg-amber-50"
            >
              <IconGift size={14} className="mr-1" /> ดูสิทธิพิเศษ / แลกรางวัล
            </Button>
          </CardFooter>
        </Card>

        <Card className="text-xs md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-muted-foreground text-xs font-bold tracking-wider uppercase">
              วิธีสะสมคะแนนในระบบ
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground space-y-4">
            <div className="flex items-start gap-3">
              <div className="bg-primary/10 text-primary shrink-0 rounded-md p-1.5">
                <IconShoppingBag size={14} />
              </div>
              <div>
                <span className="text-foreground block font-semibold">
                  ช้อปปิ้งผ่าน Sale Page ของร้านค้า
                </span>
                <span className="text-[11px]">
                  ทุกๆ การสั่งซื้อสินค้าออนไลน์ผ่านลิงก์ร้านค้าในระบบ ครบทุก 10
                  บาท จะได้รับคะแนนสะสม 1 คะแนนเข้ากระเป๋าอัตโนมัติ
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="shrink-0 rounded-md bg-amber-100 p-1.5 text-amber-700">
                <IconCoin size={14} />
              </div>
              <div>
                <span className="text-foreground block font-semibold">
                  แจ้งเบอร์โทรศัพท์ตอนซื้อของหน้าร้าน (POS)
                </span>
                <span className="text-[11px]">
                  เมื่อเดินช้อปปิ้งที่หน้าร้านค้าออฟไลน์
                  เพียงแจ้งเบอร์โทรศัพท์ที่บันทึกไว้ในโปรไฟล์นี้แก่พนักงาน
                  ระบบจะเชื่อมแต้มออนไลน์-ออฟไลน์เข้าด้วยกันทันที
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="text-muted-foreground flex items-center gap-1 text-xs font-bold tracking-wider uppercase">
          <IconHistory size={16} /> ประวัติธุรกรรมคะแนนสะสม
        </h3>

        <div className="bg-background overflow-hidden rounded-xl border">
          <Table>
            <TableHeader className="bg-muted/40 text-xs">
              <TableRow>
                <TableHead>รายละเอียดกิจกรรม</TableHead>
                <TableHead>ร้านค้า / แบรนด์</TableHead>
                <TableHead className="w-35">วัน-เวลา ทำรายการ</TableHead>
                <TableHead className="w-30 text-right">จำนวนคะแนน</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {history.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-muted/10">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`shrink-0 rounded-md border p-1 ${
                          tx.type === 'EARN'
                            ? 'border-green-200 bg-green-50 text-green-600'
                            : 'border-red-200 bg-red-50 text-red-500'
                        }`}
                      >
                        {tx.type === 'EARN' ? (
                          <IconArrowDownLeft size={14} />
                        ) : (
                          <IconArrowUpRight size={14} />
                        )}
                      </div>
                      <span className="text-foreground font-medium">
                        {tx.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground font-medium">
                    {tx.storeName}
                  </TableCell>
                  <TableCell className="text-muted-foreground font-mono">
                    {tx.createdAt}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono text-sm font-bold ${
                      tx.type === 'EARN' ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {tx.points > 0 ? `+${tx.points}` : `${tx.points}`}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
