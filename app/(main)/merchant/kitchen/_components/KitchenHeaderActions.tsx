'use client'

import { useTranslations } from 'next-intl'

import { IconRefresh, IconVolume, IconVolumeOff } from '@tabler/icons-react'

import { BranchSelectField } from '@/components/BranchSelectField'
import { StoreSelectField } from '@/components/StoreSelectField'
import { Button } from '@/components/ui/button'

interface KitchenHeaderActionsProps {
  isSoundEnabled: boolean
  onToggleSound: () => void
  onRefresh: () => void
}

export function KitchenHeaderActions({
  isSoundEnabled,
  onToggleSound,
  onRefresh,
}: KitchenHeaderActionsProps) {
  const t = useTranslations('merchant.kitchen')

  return (
    <div className="flex flex-wrap items-end gap-2">
      <StoreSelectField />
      <BranchSelectField />
      <Button size="sm" variant="outline" onClick={onToggleSound}>
        {isSoundEnabled ? (
          <IconVolume className="text-primary mr-2 size-4" />
        ) : (
          <IconVolumeOff className="text-muted-foreground mr-2 size-4" />
        )}
        {isSoundEnabled ? t('soundOn') : t('soundOff')}
      </Button>
      <Button size="icon" variant="ghost" onClick={onRefresh}>
        <IconRefresh className="size-4" />
      </Button>
    </div>
  )
}
