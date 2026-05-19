'use client'

import { useState } from 'react'

import { IconWallet } from '@tabler/icons-react'

import { PageTabHeader } from '@/components/PageTabHeader'
import { BuyerLayout } from '@/components/layout/BuyerLayout'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { WalletHistoryTable } from './_components/WalletHistoryTable'

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

export default function StoreUserBillingPage() {
  const [balance, setBalance] = useState(MOCK_WALLET_BALANCE)
  const [history, setHistory] = useState(MOCK_WALLET_HISTORY)

  return (
    <BuyerLayout>
      <PageTabHeader
        icon={IconWallet}
        title="กระเป๋าเงิน / ช่องทางชำระเงิน"
        description="จัดการเงินคงเหลือใน Wallet และตรวจสอบประวัติธุรกรรมของคุณ"
      />
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="from-primary/10 via-primary/2 to-background border-primary/20 flex flex-col justify-between overflow-hidden bg-linear-to-br xl:col-span-1">
          <CardHeader className="pb-2">
            <CardDescription className="text-primary text-xs font-bold">
              ยอดเงินคงเหลือในวอลเล็ต
            </CardDescription>
            <CardTitle className="text-foreground pt-1 text-3xl font-extrabold">
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
            <Button className="w-full">เติมเงินเข้าวอลเล็ต</Button>
          </CardFooter>
        </Card>
        <WalletHistoryTable history={history} className="xl:col-span-2" />
      </div>
    </BuyerLayout>
  )
}
