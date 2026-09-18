'use client'

import { useTranslations } from 'next-intl'

import { IconCalculator, IconHistory, IconUsers } from '@tabler/icons-react'

import { TabsList, TabsTrigger } from '@/components/ui/tabs'

export function PayrollTabList() {
  const t = useTranslations('merchant.payroll')

  return (
    <TabsList className="grid h-auto w-full max-w-xl grid-cols-3 p-1">
      <TabsTrigger
        value="settlement"
        className="flex items-center justify-center gap-1.5 py-2 text-xs sm:gap-2 sm:text-sm"
      >
        <IconCalculator className="size-4 shrink-0" />
        <span className="hidden sm:inline">{t('tabs.settlement')}</span>
        <span className="sm:hidden">{t('tabs.settlementShort')}</span>
      </TabsTrigger>
      <TabsTrigger
        value="staff"
        className="flex items-center justify-center gap-1.5 py-2 text-xs sm:gap-2 sm:text-sm"
      >
        <IconUsers className="size-4 shrink-0" />
        <span className="hidden sm:inline">{t('tabs.staff')}</span>
        <span className="sm:hidden">{t('tabs.staffShort')}</span>
      </TabsTrigger>
      <TabsTrigger
        value="history"
        className="flex items-center justify-center gap-1.5 py-2 text-xs sm:gap-2 sm:text-sm"
      >
        <IconHistory className="size-4 shrink-0" />
        <span className="hidden sm:inline">{t('tabs.history')}</span>
        <span className="sm:hidden">{t('tabs.historyShort')}</span>
      </TabsTrigger>
    </TabsList>
  )
}
