'use client'

import React from 'react'
import { useTranslations } from 'next-intl'
import { IconCalendar, IconCheck, IconClock, IconPrinter } from '@tabler/icons-react'

import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { MonthlySettlementRecord, PayoutStatus } from '@/types/profit-sharing'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface SettlementHistoryDesktopTableProps {
  settlements: MonthlySettlementRecord[]
  isLoading: boolean
  dateLocale: string
  onSelectPeriod: (period: string) => void
  handlePrint: (record: MonthlySettlementRecord) => void
}

export function SettlementHistoryDesktopTable({
  settlements,
  isLoading,
  dateLocale,
  onSelectPeriod,
  handlePrint,
}: SettlementHistoryDesktopTableProps) {
  const t = useTranslations('merchant.profitSharing')
  const { format } = useMerchantCurrency()

  return (
    <div className="hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('history.colPeriod')}</TableHead>
            <TableHead className="text-right">{t('history.colRevenue')}</TableHead>
            <TableHead className="text-right">{t('history.colNetProfit')}</TableHead>
            <TableHead className="text-right">{t('history.colAllocated')}</TableHead>
            <TableHead className="text-right">{t('history.colRetained')}</TableHead>
            <TableHead className="text-center">{t('history.colStatus')}</TableHead>
            <TableHead className="text-right">{t('history.colActions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-28" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-5 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-5 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-5 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-5 w-20" />
                </TableCell>
                <TableCell className="text-center">
                  <Skeleton className="mx-auto h-5 w-20" />
                </TableCell>
                <TableCell className="text-right">
                  <Skeleton className="ml-auto h-5 w-24" />
                </TableCell>
              </TableRow>
            ))
          ) : settlements.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-muted-foreground h-32 text-center"
              >
                <div className="flex flex-col items-center justify-center space-y-2">
                  <IconCalendar className="size-8 opacity-40" />
                  <p>{t('history.empty')}</p>
                  <p className="text-xs">{t('history.emptyDesc')}</p>
                </div>
              </TableCell>
            </TableRow>
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
                <TableRow key={record.id}>
                  {/* Period */}
                  <TableCell>
                    <div className="text-foreground font-semibold">
                      {record.periodLabel}
                    </div>
                    <div className="text-muted-foreground text-xs">
                      {startFormatted} {t('history.to')} {endFormatted}
                    </div>
                  </TableCell>

                  {/* Revenue */}
                  <TableCell className="text-right text-sm font-medium">
                    {format(Number(record.totalRevenue))}
                  </TableCell>

                  {/* Net profit */}
                  <TableCell className="text-right text-sm font-medium text-blue-600 dark:text-blue-400">
                    {format(Number(record.netProfit))}
                  </TableCell>

                  {/* Total allocated */}
                  <TableCell className="text-right text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {format(Number(record.totalAllocated))}
                  </TableCell>

                  {/* Retained */}
                  <TableCell className="text-muted-foreground text-right text-xs">
                    {format(Number(record.retainedEarnings))}
                  </TableCell>

                  {/* Transfer progress */}
                  <TableCell className="text-center">
                    <Badge
                      variant={allPaid ? 'default' : 'secondary'}
                      className={
                        allPaid
                          ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-600'
                          : 'border-amber-500/20 bg-amber-500/10 text-amber-600'
                      }
                    >
                      {allPaid ? (
                        <span className="flex items-center gap-1">
                          <IconCheck className="size-3" />{' '}
                          {t('history.allPaidFull', {
                            paid: paidCount,
                            total: totalCount,
                          })}
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <IconClock className="size-3" />{' '}
                          {t('history.partialPaidFull', {
                            paid: paidCount,
                            total: totalCount,
                          })}
                        </span>
                      )}
                    </Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs"
                        onClick={() => onSelectPeriod(record.period)}
                      >
                        {t('history.viewDetail')}
                      </Button>
                      <Button
                        variant="outline"
                        size="icon-lg"
                        onClick={() => handlePrint(record)}
                        title={t('history.printTooltip')}
                      >
                        <IconPrinter className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
    </div>
  )
}
