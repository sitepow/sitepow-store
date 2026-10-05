'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useStoreCredit } from '@/actions/billing/credit/hooks'
import { AVG_INPUT_TOKENS, AVG_OUTPUT_TOKENS } from '@/constants/ai/config'
import { Plan } from '@/generated/prisma/enums'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import { useStoreData } from '@/stores/storefront/use-store-data'
import { CreditUsageType } from '@/types/ai'
import { estimateCost } from '@/utils/ai/ai-helpers'
import { formatNumber } from '@/utils/formatting/number'
import {
  IconAlertCircle,
  IconArrowUpRight,
  IconCoins,
  IconMessageChatbot,
  IconReceipt,
  IconSparkles,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

import { PurchaseCreditDialog } from './PurchaseCreditDialog'

interface StoreCreditCardProps {
  className?: string
}

export function StoreCreditCard({ className }: StoreCreditCardProps = {}) {
  const pathname = usePathname()
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

  const isOnCreditsPage = pathname === '/merchant/credits'

  return (
    <div
      className={cn(
        'group/credit relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-primary/30 hover:shadow-md',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-75 transition-opacity duration-300 group-hover/credit:opacity-100" />
      <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-primary/8 blur-3xl transition-all duration-500 group-hover/credit:scale-125 group-hover/credit:bg-primary/12" />
      <div>
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform duration-200 group-hover/credit:scale-105">
              <IconCoins className="size-4.5 sm:size-5 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold text-foreground tracking-tight">
                  เครดิตคงเหลือ
                </span>
                {!isLoading && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0 font-medium h-4.5',
                      balance > 0
                        ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400',
                    )}
                  >
                    {balance > 0 ? 'พร้อมใช้งาน' : 'เครดิตหมด'}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                AI & Slip Automation
              </p>
            </div>
          </div>
          {store?.plan && (
            <Badge
              variant="outline"
              className="text-[10px] font-semibold uppercase tracking-wider bg-muted/60 border-border/50 text-muted-foreground px-2 py-0.5"
            >
              Plan: {store.plan}
            </Badge>
          )}
        </div>
        <div className="relative mt-5">
          <span className="text-xs font-medium text-muted-foreground">
            ยอดเครดิตปัจจุบัน
          </span>
          <div className="flex items-baseline gap-2 pt-0.5">
            {isLoading ? (
              <Skeleton className="h-9 w-36 rounded-lg" />
            ) : (
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-heading tabular-nums">
                {formatNumber(balance)}
              </span>
            )}
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              เครดิต
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed mt-1.5 line-clamp-2">
            ใช้ชำระค่าบริการตอบแชท AI และตรวจสอบสลิปอัตโนมัติตลอด 24 ชั่วโมง
          </p>
        </div>
        {!isLoading && balance > 0 ? (
          <div className="relative mt-4 space-y-2">
            <div className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
              <IconSparkles className="size-3 text-primary" />
              <span>ความสามารถที่ใช้งานได้ประมาณ</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {/* AI Chat Estimate */}
              <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-2.5 transition-colors hover:border-primary/25 hover:bg-muted/50">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                  <IconMessageChatbot className="size-4 stroke-[1.8]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-muted-foreground truncate">
                    ตอบแชท AI
                  </div>
                  <div className="text-xs font-bold text-foreground tabular-nums truncate">
                    ~{formatNumber(estimateAiMessages)}{' '}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      ข้อความ
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 rounded-xl border border-border/60 bg-muted/30 p-2.5 transition-colors hover:border-primary/25 hover:bg-muted/50">
                <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary ring-1 ring-primary/20">
                  <IconReceipt className="size-4 stroke-[1.8]" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[10px] text-muted-foreground truncate">
                    ตรวจสลิปอัตโนมัติ
                  </div>
                  <div className="text-xs font-bold text-foreground tabular-nums truncate">
                    ~{formatNumber(estimateSlipChecks)}{' '}
                    <span className="text-[10px] font-normal text-muted-foreground">
                      สลิป
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : !isLoading && balance <= 0 ? (
          <div className="relative mt-4 flex items-center gap-2.5 rounded-xl border border-amber-500/25 bg-amber-500/5 p-3 text-amber-600 dark:text-amber-400">
            <IconAlertCircle className="size-4 shrink-0" />
            <p className="text-xs leading-normal">
              เครดิตหมดแล้ว เติมเครดิตเพื่อเปิดการตอบแชทและตรวจสลิปต่อเนื่อง
            </p>
          </div>
        ) : null}
      </div>
      <div className="relative mt-5 pt-3.5 border-t border-border/50 flex flex-wrap items-center justify-between gap-2.5">
        <PurchaseCreditDialog />
        {!isOnCreditsPage && (
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-xs text-muted-foreground hover:text-foreground h-8 px-2.5"
          >
            <Link href="/merchant/credits">
              ดูประวัติเครดิต <IconArrowUpRight className="ml-1 size-3.5" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}
