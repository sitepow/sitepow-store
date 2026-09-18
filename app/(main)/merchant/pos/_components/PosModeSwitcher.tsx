'use client'

import { useTranslations } from 'next-intl'

import { IconArmchair, IconCashRegister } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'

export type PosMode = 'quick' | 'tables'

interface PosModeSwitcherProps {
  mode: PosMode
  onModeChange: (mode: PosMode) => void
}

export function PosModeSwitcher({ mode, onModeChange }: PosModeSwitcherProps) {
  const t = useTranslations('merchant.pos')

  return (
    <div className="flex items-center gap-2 border-b pb-2">
      <Button
        size="sm"
        variant={mode === 'quick' ? 'default' : 'outline'}
        onClick={() => onModeChange('quick')}
        className="gap-1.5"
      >
        <IconCashRegister className="size-4" />
        {t('modes.quick', { defaultValue: 'แคชเชียร์ขายด่วน' })}
      </Button>
      <Button
        size="sm"
        variant={mode === 'tables' ? 'default' : 'outline'}
        onClick={() => onModeChange('tables')}
        className="gap-1.5"
      >
        <IconArmchair className="size-4" />
        {t('modes.tables', { defaultValue: 'ผังโต๊ะร้านอาหาร' })}
      </Button>
    </div>
  )
}
