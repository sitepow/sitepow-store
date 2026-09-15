'use client'

import React, { useState } from 'react'

import { useLocale, useTranslations } from 'next-intl'

import { useMonthlySettlementHistory } from '@/actions/hooks/profit-sharing'
import { useMerchantCurrency } from '@/hooks/use-merchant-currency'
import { MonthlySettlementRecord, PayoutStatus } from '@/types/profit-sharing'
import {
  IconCalendar,
  IconCheck,
  IconClock,
  IconHistory,
  IconLock,
  IconPrinter,
} from '@tabler/icons-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

import { SettlementPrintStatement } from './SettlementPrintStatement'

interface SettlementHistoryViewProps {
  storeId: string
  storeName?: string
  onSelectPeriod: (period: string) => void
}

export function SettlementHistoryView({
  storeId,
  storeName,
  onSelectPeriod,
}: SettlementHistoryViewProps) {
  const t = useTranslations('merchant.profitSharing')
  const locale = useLocale()
  const { data: settlements = [], isLoading } =
    useMonthlySettlementHistory(storeId)
  const { format } = useMerchantCurrency()

  const [printRecord, setPrintRecord] =
    useState<MonthlySettlementRecord | null>(null)
  const [printOpen, setPrintOpen] = useState(false)

  const handlePrint = (record: MonthlySettlementRecord) => {
    setPrintRecord(record)
    setPrintOpen(true)
  }

  const dateLocale = locale === 'th' ? 'th-TH' : 'en-US'

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <IconHistory className="text-primary size-5" />
            {t('tabs.history')}
          </CardTitle>
          <CardDescription>{t('history.cardDesc')}</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mobile Card View */}
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

          {/* Desktop Table View */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t('history.colPeriod')}</TableHead>
                  <TableHead className="text-right">
                    {t('history.colRevenue')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('history.colNetProfit')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('history.colAllocated')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('history.colRetained')}
                  </TableHead>
                  <TableHead className="text-center">
                    {t('history.colStatus')}
                  </TableHead>
                  <TableHead className="text-right">
                    {t('history.colActions')}
                  </TableHead>
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
        </CardContent>
      </Card>

      <SettlementPrintStatement
        open={printOpen}
        setOpen={setPrintOpen}
        settlement={printRecord}
        storeName={storeName}
      />
    </div>
  )
}
