'use client'

import { useTranslations } from 'next-intl'
import { IconDatabase, IconWand, IconX } from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Spinner } from '@/components/ui/spinner'
import { PRODUCT_PRESETS_MASTER } from '@/constants/product-preset'
import { AiGenTask } from '@/types/ai'

import { CopyProductDataPicker } from './CopyProductDataPicker'

interface ProductFormHeaderProps {
  selectedStoreId?: string
  isDirty: boolean
  isPending: boolean
  isGenAll: boolean
  onAiTrigger: (task: AiGenTask, action: () => void) => void
  onGenAll: () => void
  onGenSlug: () => void
  onApplyPreset: (id: string) => void
  onResetForm: () => void
  onSubmit: () => void
}

export function ProductFormHeader({
  selectedStoreId,
  isDirty,
  isPending,
  isGenAll,
  onAiTrigger,
  onGenAll,
  onGenSlug,
  onApplyPreset,
  onResetForm,
  onSubmit,
}: ProductFormHeaderProps) {
  const t = useTranslations('merchant.products.form')

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center gap-2.5">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" disabled={isGenAll}>
              {isGenAll ? (
                <Spinner className="mr-2" />
              ) : (
                <IconWand className="mr-2 size-4" />
              )}{' '}
              {t('aiTools')}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{t('createContent')}</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => onAiTrigger(AiGenTask.ALL, onGenAll)}
            >
              {t('aiThinkAll')}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => onAiTrigger(AiGenTask.SLUG, onGenSlug)}
            >
              {t('aiThinkSlug')}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{t('loadPresets')}</DropdownMenuLabel>
            {PRODUCT_PRESETS_MASTER.map((preset) => (
              <DropdownMenuItem
                key={preset.id}
                onClick={() => onApplyPreset(preset.id)}
              >
                <IconDatabase className="mr-2 size-4" /> {preset.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {selectedStoreId && <CopyProductDataPicker storeId={selectedStoreId} />}

        {isDirty && (
          <Button
            type="button"
            disabled={isPending}
            variant="outline"
            onClick={onResetForm}
          >
            <IconX /> {t('clearSettings')}
          </Button>
        )}

        {isDirty && (
          <Button onClick={onSubmit} disabled={isPending}>
            {isPending && <Spinner />}
            {isPending ? t('savingProduct') : t('saveProduct')}
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
