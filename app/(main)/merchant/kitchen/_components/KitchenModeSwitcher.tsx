'use client'

import { useTranslations } from 'next-intl'

import { IconLayoutGrid, IconListDetails } from '@tabler/icons-react'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface KitchenModeSwitcherProps {
  viewMode: 'tickets' | 'aggregated'
  onViewModeChange: (mode: 'tickets' | 'aggregated') => void
  ordersCount: number
  aggregatedCount: number
}

export function KitchenModeSwitcher({
  viewMode,
  onViewModeChange,
  ordersCount,
  aggregatedCount,
}: KitchenModeSwitcherProps) {
  const t = useTranslations('merchant.kitchen')

  return (
    <Tabs
      value={viewMode}
      onValueChange={(v) => onViewModeChange(v as 'tickets' | 'aggregated')}
      className="w-full"
    >
      <TabsList>
        <TabsTrigger value="tickets" className="gap-2">
          <IconListDetails className="size-4" />
          {t('viewTickets', { count: ordersCount })}
        </TabsTrigger>
        <TabsTrigger value="aggregated" className="gap-2">
          <IconLayoutGrid className="size-4" />
          {t('viewAggregated', { count: aggregatedCount })}
        </TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
