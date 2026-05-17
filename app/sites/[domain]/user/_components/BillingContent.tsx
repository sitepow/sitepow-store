'use client'

import { useState } from 'react'

import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconCreditCard,
  IconHistory,
  IconPlus,
  IconWallet,
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

const MOCK_WALLET_BALANCE = 1250.0
const MOCK_WALLET_HISTORY = [
  {
    id: 'tx-001',
    type: 'SPEND',
    description: 'ชำระค่าสินค้าออเดอร์ ORD-9942',
    amount: -490.0,
    createdAt: '2026-05-17 10:14',
  },
  {
    id: 'tx-002',
    type: 'TOPUP',
    description: 'เติมเงินผ่าน PromptPay QR',
    amount: 1000.0,
    createdAt: '2026-05-15 13:00',
  },
  {
    id: 'tx-003',
    type: 'REFUND',
    description: 'คืนเงินเนื่องจากยกเลิกออเดอร์ ORD-9120',
    amount: 350.0,
    createdAt: '2026-05-10 11:20',
  },
]

export function BillingContent() {
  const [balance, setBalance] = useState(MOCK_WALLET_BALANCE)
  const [history, setHistory] = useState(MOCK_WALLET_HISTORY)

  return (
    <div className="space-y-6">
      <PageTabHeader
        icon={IconWallet}
        title="กระเป๋าเงิน / ช่องทางชำระเงิน"
        description="จัดการเงินคงเหลือใน Wallet
          ผูกบัตรเครดิตเพื่อความสะดวกรวดเร็วในการเช็คเอาท์
          และตรวจสอบประวัติธุรกรรมของคุณ"
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card className="from-primary/10 via-primary/2 to-background border-primary/20 flex flex-col justify-between overflow-hidden bg-linear-to-br md:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary text-xs font-bold tracking-wider uppercase">
              ยอดเงินคงเหลือในวอลเล็ต
            </CardDescription>
            <CardTitle className="text-foreground pt-1 text-3xl font-extrabold tracking-tight">
              ฿
              {balance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground pb-4 text-[11px] leading-relaxed">
            สามารถใช้ชำระค่าสินค้าผ่านหน้า Sale Page ได้ทันที
            ตัดยอดอัตโนมัติโดยไม่ต้องรอตรวจสอบสลิปเงินโอน
          </CardContent>
          <CardFooter className="bg-muted/5 border-t pt-3 pb-3">
            <Button size="sm" className="h-8 w-full text-xs">
              เติมเงินเข้าวอลเล็ต
            </Button>
          </CardFooter>
        </Card>

        <div className="space-y-3 md:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-muted-foreground flex items-center gap-1.5 text-xs font-bold tracking-wider uppercase">
              <IconCreditCard size={16} /> บัตรเครดิต / เดบิตของฉัน
            </h3>
            <Button size="sm" variant="outline" className="h-7 gap-1 text-xs">
              <IconPlus size={14} /> ผูกบัตรใหม่
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="text-muted-foreground col-span-2 rounded-xl border border-dashed py-8 text-center text-xs">
              ยังไม่มีการผูกบัตรเครดิตในระบบ
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 pt-2">
        <h3 className="text-muted-foreground flex items-center gap-1 text-xs font-bold tracking-wider uppercase">
          <IconHistory size={16} /> ประวัติธุรกรรมวอลเล็ต
        </h3>

        <div className="bg-background overflow-hidden rounded-xl border">
          <Table>
            <TableHeader className="bg-muted/40 text-xs">
              <TableRow>
                <TableHead className="w-25">รหัสธุรกรรม</TableHead>
                <TableHead>รายละเอียดรายการ</TableHead>
                <TableHead className="w-35">วัน-เวลา ทำรายการ</TableHead>
                <TableHead className="w-30 text-right">จำนวนเงิน</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-xs">
              {history.map((tx) => (
                <TableRow key={tx.id} className="hover:bg-muted/10">
                  <TableCell className="text-muted-foreground font-mono font-medium">
                    {tx.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`shrink-0 rounded-md border p-1 ${
                          tx.type === 'TOPUP' || tx.type === 'REFUND'
                            ? 'border-green-200 bg-green-50 text-green-600'
                            : 'bg-muted border-muted-foreground/10 text-muted-foreground'
                        }`}
                      >
                        {tx.type === 'TOPUP' || tx.type === 'REFUND' ? (
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
                  <TableCell className="text-muted-foreground font-mono">
                    {tx.createdAt}
                  </TableCell>
                  <TableCell
                    className={`text-right font-mono font-bold ${
                      tx.amount > 0 ? 'text-green-600' : 'text-foreground'
                    }`}
                  >
                    {tx.amount > 0
                      ? `+฿${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                      : `-฿${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
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
