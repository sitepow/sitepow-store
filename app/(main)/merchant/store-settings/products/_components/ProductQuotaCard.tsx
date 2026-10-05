'use client'

import Link from 'next/link'

import { useProductQuota } from '@/actions/catalog/product/hooks'
import { ALL_STORES, useStoreFilter } from '@/stores/merchant/use-store-filter'
import { formatNumber } from '@/utils/formatting/number'
import {
  IconAlertCircle,
  IconArrowUpRight,
  IconCircleCheck,
  IconInfinity,
  IconPackage,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export interface ProductQuotaCardProps {
  className?: string
}

export function ProductQuotaCard({ className }: ProductQuotaCardProps = {}) {
  const { selectedStoreId } = useStoreFilter()
  const { data: quota, isLoading } = useProductQuota(selectedStoreId)

  if (selectedStoreId === ALL_STORES) {
    return null
  }

  const productCount = quota?.productCount ?? 0
  const maxProducts = quota?.maxProducts
  const isUnlimited = maxProducts === null || maxProducts === undefined
  const isLimitReached = !isUnlimited && productCount >= maxProducts
  const progress =
    !isUnlimited && maxProducts > 0
      ? Math.min(100, (productCount / maxProducts) * 100)
      : 0
  const remaining =
    !isUnlimited ? Math.max(0, maxProducts - productCount) : null

  return (
    <div
      className={cn(
        'group/quota relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/70 bg-card p-5 sm:p-6 shadow-xs transition-all duration-200 hover:border-primary/30 hover:shadow-md',
        className,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-linear-to-r from-transparent via-primary/50 to-transparent opacity-75 transition-opacity duration-300 group-hover/quota:opacity-100" />
      <div className="pointer-events-none absolute -right-10 -top-10 size-36 rounded-full bg-primary/8 blur-3xl transition-all duration-500 group-hover/quota:scale-125 group-hover/quota:bg-primary/12" />
      <div>
        <div className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 sm:size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-transform duration-200 group-hover/quota:scale-105">
              <IconPackage className="size-4.5 sm:size-5 stroke-[1.8]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-sm font-semibold text-foreground tracking-tight">
                  คลังสินค้าทั้งหมด
                </span>
                {!isLoading && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-[10px] px-1.5 py-0 font-medium h-4.5',
                      isUnlimited &&
                        'border-blue-500/25 bg-blue-500/10 text-blue-600 dark:text-blue-400',
                      !isUnlimited &&
                        isLimitReached &&
                        'border-rose-500/25 bg-rose-500/10 text-rose-600 dark:text-rose-400',
                      !isUnlimited &&
                        !isLimitReached &&
                        progress >= 80 &&
                        'border-amber-500/25 bg-amber-500/10 text-amber-600 dark:text-amber-400',
                      !isUnlimited &&
                        !isLimitReached &&
                        progress < 80 &&
                        'border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
                    )}
                  >
                    {isUnlimited
                      ? 'ไม่จำกัด'
                      : isLimitReached
                        ? 'เต็มโควตา'
                        : progress >= 80
                          ? `ใกล้เต็ม (${progress.toFixed(0)}%)`
                          : `ปกติ (${progress.toFixed(0)}%)`}
                  </Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">
                โควตาสินค้าตามแพ็กเกจร้านค้าของคุณ
              </p>
            </div>
          </div>
          {!isUnlimited && (
            <Button
              variant="outline"
              size="sm"
              asChild
              className="h-8 text-xs font-medium shrink-0 bg-background/80 hover:bg-background"
            >
              <Link href="/pricing" target="_blank">
                อัปเกรดแพลน <IconArrowUpRight className="ml-1 size-3.5" />
              </Link>
            </Button>
          )}
        </div>
        <div className="relative mt-5">
          <span className="text-xs font-medium text-muted-foreground">
            จำนวนสินค้าที่ลงขายแล้ว
          </span>
          <div className="flex items-baseline gap-2 pt-0.5 flex-wrap">
            {isLoading ? (
              <Skeleton className="h-9 w-36 rounded-lg" />
            ) : (
              <span className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground font-heading tabular-nums">
                {formatNumber(productCount)}
              </span>
            )}
            <span className="text-xs sm:text-sm font-medium text-muted-foreground">
              /{' '}
              {isUnlimited ? (
                <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                  <IconInfinity className="size-4 inline" /> ไม่จำกัด
                </span>
              ) : (
                `${formatNumber(maxProducts)} รายการ`
              )}
            </span>
          </div>
        </div>
        {!isLoading && !isUnlimited && (
          <div className="relative mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-medium text-foreground">
                การใช้โควตา {progress.toFixed(0)}%
              </span>
              <span className="text-muted-foreground">
                {isLimitReached ? (
                  <span className="text-rose-600 dark:text-rose-400 font-semibold">
                    เพิ่มสินค้าไม่ได้แล้ว
                  </span>
                ) : (
                  `ลงเพิ่มได้อีก ~${formatNumber(remaining ?? 0)} รายการ`
                )}
              </span>
            </div>
            <Progress
              value={progress}
              className={cn(
                'h-2 bg-muted/60',
                isLimitReached &&
                  '*:data-[slot=progress-indicator]:bg-rose-500',
                !isLimitReached &&
                  progress >= 80 &&
                  '*:data-[slot=progress-indicator]:bg-amber-500',
              )}
            />
          </div>
        )}
        {!isLoading && isLimitReached && (
          <div className="relative mt-3.5 flex items-center gap-2.5 rounded-xl border border-rose-500/25 bg-rose-500/5 p-2.5 sm:p-3 text-xs text-rose-600 dark:text-rose-400">
            <IconAlertCircle className="size-4 shrink-0" />
            <p className="leading-normal">
              คุณใช้โควตาสินค้าครบตามแพลนแล้ว อัปเกรดแพลนเพื่อเพิ่มสินค้าใหม่ได้ไม่สะดุด
            </p>
          </div>
        )}
        {!isLoading && isUnlimited && (
          <div className="relative mt-3.5 flex items-center gap-2 rounded-xl border border-blue-500/20 bg-blue-500/5 p-2.5 text-xs text-blue-600 dark:text-blue-400">
            <IconCircleCheck className="size-4 shrink-0" />
            <p className="leading-normal">
              แพลนนี้ไม่จำกัดจำนวนสินค้า คุณสามารถเพิ่มสินค้าเข้าสู่ร้านค้าได้ไม่จำกัด
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
