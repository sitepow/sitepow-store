'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconCalendar, IconCheck, IconClock, IconPrinter } from '@tabler/icons-react'

import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { MonthlySettlementRecord, PayoutStatus } from '@/types/profit-sharing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

interface SettlementHistoryMobileListProps {
  settlements: MonthlySettlementRecord[]
  isLoading: boolean
  dateLocale: string
  onSelectPeriod: (period: string) => void
  handlePrint: (record: MonthlySettlementRecord) => void
}

export function SettlementHistoryMobileList({
  settlements,
  isLoading,
  dateLocale,
  onSelectPeriod,
  handlePrint,
}: SettlementHistoryMobileListProps) {
  const t = useTranslations('merchant.profitSharing')
  const { format } = useMerchantCurrency()

  return (
    <div className="divide-y md:hidden">
      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3 p-4">
            <div className="flex items-start justify-between">
              <Skeleton className="h-5 w-28" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="h-10 w-full rounded-lg" />
            <Skeleton className="h-8 w-24" />
          </div>
        ))
      ) : settlements.length === 0 ? (
        <div className="text-muted-foreground flex flex-col items-center justify-center space-y-2 p-8 text-center">
          <IconCalendar className="size-8 opacity-40" />
          <p className="text-sm">{t('history.empty')}</p>
          <p className="text-xs">{t('history.emptyDesc')}</p>
        </div>
      ) : (
        settlements.map((record) => {
          const paidCount = record.payouts.filter(
            (p) => p.status === PayoutStatus.PAID,
          ).length
          const totalCount = record.payouts.length
          const allPaid = totalCount > 0 && paidCount === totalCount

          const startFormatted = new Date(
            record.startDate,
          ).toLocaleDateString(dateLocale)
          const endFormatted = new Date(
            record.endDate,
          ).toLocaleDateString(dateLocale)

          return (
            <div key={record.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-foreground font-semibold">
                    {record.periodLabel}
                  </div>
                  <div className="text-muted-foreground text-xs">
                    {startFormatted} {t('history.to')} {endFormatted}
                  </div>
                </div>
                <Badge
                  variant={allPaid ? 'default' : 'secondary'}
                  className={
                    allPaid
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                      : 'border-amber-500/20 bg-amber-500/10 text-amber-600'
                  }
                >
                  {allPaid ? (
                    <span className="flex items-center gap-1 text-xs">
                      <IconCheck className="size-3" />{' '}
                      {t('history.allPaid', {
                        paid: paidCount,
                        total: totalCount,
                      })}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs">
                      <IconClock className="size-3" />{' '}
                      {t('history.partialPaid', {
                        paid: paidCount,
                        total: totalCount,
                      })}
                    </span>
                  )}
                </Badge>
              </div>

              {/* Financial stats summary */}
              <div className="bg-muted/40 grid grid-cols-3 gap-2 rounded-lg p-2.5 text-center text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {t('history.revenue')}
                  </span>
                  <span className="text-foreground font-semibold">
                    {format(Number(record.totalRevenue))}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {t('history.netProfit')}
                  </span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {format(Number(record.netProfit))}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">
                    {t('history.totalAllocated')}
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    {format(Number(record.totalAllocated))}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="border-border/40 flex items-center justify-end gap-2 border-t pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={() => handlePrint(record)}
                >
                  <IconPrinter className="mr-1 size-3.5" />
                  {t('history.print')}
                </Button>
                <Button
                  size="sm"
                  className="text-xs"
                  onClick={() => onSelectPeriod(record.period)}
                >
                  {t('history.viewDetail')}
                </Button>
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
