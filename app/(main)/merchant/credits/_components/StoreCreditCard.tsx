'use client'

import { useStoreCredit } from '@/actions/hooks/credit'
import { ALL_STORES, useStoreFilter } from '@/stores/use-store-filter'
import { formatNumber } from '@/utils/pricing'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

import { PurchaseCreditDialog } from './PurchaseCreditDialog'

export function StoreCreditCard() {
  const { selectedStoreId } = useStoreFilter()
  const storeId = selectedStoreId === ALL_STORES ? '' : selectedStoreId
  const { data, isLoading } = useStoreCredit(storeId)

  const balance = Number(data?.balance ?? 0)

  const COST_PER_AI_MESSAGE = 1.5
  const COST_PER_SLIP = 4

  const estimateAiMessages = Math.floor(balance / COST_PER_AI_MESSAGE)
  const estimateSlipChecks = Math.floor(balance / COST_PER_SLIP)
  return (
    <Card className="from-primary/10 via-primary/2 to-background border-primary/20 flex h-fit flex-col justify-between overflow-hidden bg-linear-to-br xl:col-span-1">
      <CardHeader className="pb-2">
        <CardDescription className="text-primary text-xs font-bold">
          ยอดเครดิตคงเหลือ
        </CardDescription>
        <CardTitle className="text-foreground flex items-baseline gap-1 pt-1 text-4xl font-extrabold">
          {isLoading ? (
            <Skeleton className="h-9 w-40" />
          ) : (
            formatNumber(Number(data?.balance ?? 0))
          )}
          <span className="text-muted-foreground text-xs font-normal">
            เครดิต
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-muted-foreground pb-4 text-[11px] leading-relaxed">
        ใช้ชำระค่าบริการ AI และตรวจสลิปอัตโนมัติ ช่วยลดงานแมนนวล เพิ่มความแม่นยำ
        และปิดการขายได้อย่างรวดเร็วตลอด 24 ชั่วโมง
        {!isLoading && balance > 0 && (
          <div className="bg-primary/5 border-primary/10 mt-5 rounded-md border p-2">
            <p className="text-primary font-semibold">
              เครดิตนี้ใช้งานได้ประมาณ
            </p>
            <p>
              • ตอบแชท AI ได้อีก ~{formatNumber(estimateAiMessages)} ข้อความ
            </p>
            <p>• ตรวจสลิปได้อีก ~{formatNumber(estimateSlipChecks)} สลิป</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/5 flex flex-wrap gap-2.5 border-t pt-3 pb-3">
        <PurchaseCreditDialog />
        <Button variant="outline">โอนเครดิตไปให้ร้านค้าอื่น</Button>
      </CardFooter>
    </Card>
  )
}
