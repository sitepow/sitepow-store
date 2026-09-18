'use client'

import { useTranslations } from 'next-intl'

import type { TableZoneWithCount } from '@/types/restaurant'

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface TableZoneFilterProps {
  zones: TableZoneWithCount[]
  selectedZoneId: string
  onSelectZone: (zoneId: string) => void
  totalTablesCount: number
  noZoneCount: number
}

export function TableZoneFilter({
  zones,
  selectedZoneId,
  onSelectZone,
  totalTablesCount,
  noZoneCount,
}: TableZoneFilterProps) {
  const t = useTranslations('merchant.tables')

  return (
    <Tabs
      value={selectedZoneId}
      onValueChange={onSelectZone}
      className="w-full"
    >
      <TabsList className="h-auto flex-wrap p-1">
        <TabsTrigger value="ALL">
          {t('filterAll', { count: totalTablesCount })}
        </TabsTrigger>
        {zones.map((zone) => (
          <TabsTrigger key={zone.id} value={zone.id}>
            {zone.name} ({zone._count?.tables ?? 0})
          </TabsTrigger>
        ))}
        {noZoneCount > 0 && (
          <TabsTrigger value="NO_ZONE">
            {t('filterNoZone', { count: noZoneCount })}
          </TabsTrigger>
        )}
      </TabsList>
    </Tabs>
  )
}
