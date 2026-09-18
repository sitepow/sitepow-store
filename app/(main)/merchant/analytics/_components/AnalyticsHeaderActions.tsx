'use client'

import { useTranslations } from 'next-intl'

import { IconSparkles } from '@tabler/icons-react'

import { BranchSelectField } from '@/components/BranchSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Button } from '@/components/ui/button'
import { DatePicker } from '@/components/ui/date-picker'

interface AnalyticsHeaderActionsProps {
  startDate: string
  endDate: string
  onStartDateChange: (val: string) => void
  onEndDateChange: (val: string) => void
  onGenerateAi: () => void
  isGeneratingAi: boolean
  isAiDisabled: boolean
}

export function AnalyticsHeaderActions({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  onGenerateAi,
  isGeneratingAi,
  isAiDisabled,
}: AnalyticsHeaderActionsProps) {
  const t = useTranslations('merchant.analytics')

  return (
    <div className="flex flex-wrap items-end gap-2.5">
      <div className="flex items-end gap-2">
        <div className="w-36">
          <DatePicker
            value={startDate}
            onChange={onStartDateChange}
            placeholder={t('dateRange.startDatePlaceholder')}
          />
        </div>
        <span className="text-muted-foreground text-sm">-</span>
        <div className="w-36">
          <DatePicker
            value={endDate}
            onChange={onEndDateChange}
            placeholder={t('dateRange.endDatePlaceholder')}
          />
        </div>
      </div>
      <StoreSelectField />
      <BranchSelectField />
      <Button onClick={onGenerateAi} disabled={isAiDisabled} className="gap-2">
        <IconSparkles className="size-4" />
        {isGeneratingAi ? t('aiButton.generating') : t('aiButton.generate')}
      </Button>
    </div>
  )
}
