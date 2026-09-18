'use client'

import React, { useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { IconHistory } from '@tabler/icons-react'

import { useMonthlySettlementHistory } from '@/actions/hooks/profit-sharing'
import { MonthlySettlementRecord } from '@/types/profit-sharing'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'

import { SettlementHistoryDesktopTable } from './SettlementHistoryDesktopTable'
import { SettlementHistoryMobileList } from './SettlementHistoryMobileList'
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
          <SettlementHistoryMobileList
            settlements={settlements}
            isLoading={isLoading}
            dateLocale={dateLocale}
            onSelectPeriod={onSelectPeriod}
            handlePrint={handlePrint}
          />
          <SettlementHistoryDesktopTable
            settlements={settlements}
            isLoading={isLoading}
            dateLocale={dateLocale}
            onSelectPeriod={onSelectPeriod}
            handlePrint={handlePrint}
          />
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
