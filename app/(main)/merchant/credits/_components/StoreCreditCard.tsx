'use client'

import { useStoreCredit } from '@/actions/billing/credit/hooks'
import { AVG_INPUT_TOKENS, AVG_OUTPUT_TOKENS } from '@/constants/ai/config'
import { Plan } from '@/generated/prisma/enums'
import { useStoreData } from '@/stores/storefront/use-store-data'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import { CreditUsageType } from '@/types/ai'
import { estimateCost } from '@/utils/ai/ai-helpers'
import { formatNumber } from '@/utils/formatting/number'

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
  const { store } = useStoreData()
  const { data, isLoading } = useStoreCredit(storeId)

  const balance = Number(data?.balance ?? 0)

  const aiCost = estimateCost(
    CreditUsageType.AI,
    store?.plan || Plan.FREE,
    AVG_INPUT_TOKENS,
    AVG_OUTPUT_TOKENS,
  )

  const slipCost = estimateCost(CreditUsageType.SLIP, store?.plan || Plan.FREE)

  const estimateAiMessages =
    balance > 0 ? Math.floor(balance / aiCost.credits) : 0
  const estimateSlipChecks =
    balance > 0 ? Math.floor(balance / slipCost.credits) : 0

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
      <CardContent className="text-muted-foreground max-w-96 pb-4 text-[11px] leading-relaxed">
        ใช้ชำระค่าบริการ AI และตรวจสลิปอัตโนมัติ ช่วยลดงานแมนนวล เพิ่มความแม่นยำ
        และปิดการขายได้อย่างรวดเร็วตลอด 24 ชั่วโมง
        {!isLoading && balance > 0 && (
          <div className="bg-primary/5 border-primary/10 mt-5 rounded-md border p-2">
            <p className="text-primary font-semibold">
              เครดิตนี้ใช้งานได้ประมาณ
            </p>
            <p>
              - ตอบแชท AI ได้อีก ~{formatNumber(estimateAiMessages)} ข้อความ
            </p>
            <p>- ตรวจสลิปได้อีก ~{formatNumber(estimateSlipChecks)} สลิป</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-muted/5 flex flex-wrap gap-2.5 border-t pt-3 pb-3">
        <PurchaseCreditDialog />
      </CardFooter>
    </Card>
  )
}
