'use client'

import { useTranslations } from 'next-intl'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  IconLock,
  IconLockOpen,
  IconPrinter,
  IconRefresh,
} from '@tabler/icons-react'

interface SettlementPeriodControlBarProps {
  selectedPeriod: string
  onSelectPeriod: (period: string) => void
  periodOptions: { value: string; label: string }[]
  isClosed: boolean
  hasExistingRecord: boolean
  isSaving: boolean
  isClosing: boolean
  onRefresh: () => void
  onPrint: () => void
  onCloseCycle: () => void
  onReopenCycle: () => void
}

export function SettlementPeriodControlBar({
  selectedPeriod,
  onSelectPeriod,
  periodOptions,
  isClosed,
  hasExistingRecord,
  isSaving,
  isClosing,
  onRefresh,
  onPrint,
  onCloseCycle,
  onReopenCycle,
}: SettlementPeriodControlBarProps) {
  const t = useTranslations('merchant.profitSharing')

  return (
    <div className="bg-muted/40 flex flex-col gap-3 rounded-xl border p-3.5 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-2">
          <span className="text-foreground text-sm font-medium whitespace-nowrap">
            {t('settlement.selectPeriod')}:
          </span>
          <Select value={selectedPeriod} onValueChange={onSelectPeriod}>
            <SelectTrigger className="bg-background w-full sm:w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periodOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          {isClosed ? (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600"
            >
              <IconLock className="size-3" />
              {t('settlement.settlementClosed')}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="inline-flex items-center gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600"
            >
              <IconLockOpen className="size-3" />
              {hasExistingRecord
                ? t('settlement.savedInDb')
                : t('settlement.autoDraft')}
            </Badge>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          title={t('settlement.refreshTooltip')}
          className="text-xs"
        >
          <IconRefresh className="mr-1 size-3.5" />
          {t('settlement.refreshLatest')}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onPrint}
          className="text-xs"
        >
          <IconPrinter className="mr-1 size-3.5" />
          <span className="hidden sm:inline">
            {t('settlement.printStatement')}
          </span>
          <span className="sm:hidden">{t('settlement.printShort')}</span>
        </Button>

        {!isClosed ? (
          <Button
            size="sm"
            onClick={onCloseCycle}
            disabled={isSaving || isClosing}
            className="col-span-2 text-xs sm:col-span-1"
          >
            <IconLock className="mr-1 size-3.5" />
            {t('settlement.closeSettlement')}
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={onReopenCycle}
            disabled={isSaving || isClosing}
            className="col-span-2 text-xs sm:col-span-1"
          >
            <IconLockOpen className="mr-1 size-3.5" />
            {t('settlement.reopenSettlement')}
          </Button>
        )}
      </div>
    </div>
  )
}

