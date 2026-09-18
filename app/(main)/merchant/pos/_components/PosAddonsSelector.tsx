'use client'

import { useTranslations } from 'next-intl'

import { POSProductItem } from '@/actions/pos/product'
import { IconCheck } from '@tabler/icons-react'

import { cn } from '@/lib/utils'

interface PosAddonsSelectorProps {
  addons?: POSProductItem['addons']
  selectedAddonIds: string[]
  onToggleAddon: (id: string) => void
  formatCurrency: (val: number) => string
}

export function PosAddonsSelector({
  addons,
  selectedAddonIds,
  onToggleAddon,
  formatCurrency,
}: PosAddonsSelectorProps) {
  const t = useTranslations('merchant.pos')

  if (!addons || addons.length === 0) {
    return null
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
          {t('toppingsAndAddons')}
        </span>
        {selectedAddonIds.length > 0 && (
          <span className="text-primary text-xs font-medium">
            เลือก {selectedAddonIds.length} รายการ
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {addons.map((addon) => {
          const isDisabled = !addon.isAvailable
          const isChecked = selectedAddonIds.includes(addon.id)

          return (
            <button
              key={addon.id}
              type="button"
              disabled={isDisabled}
              onClick={() => onToggleAddon(addon.id)}
              className={cn(
                'flex items-center justify-between rounded-lg border p-2.5 text-left transition-colors sm:p-3',
                isChecked
                  ? 'border-primary bg-primary/5 shadow-2xs'
                  : 'border-border/70 bg-card hover:border-border hover:bg-muted/40 text-foreground',
                isDisabled && 'cursor-not-allowed opacity-40 grayscale',
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5 pr-2">
                <span
                  className={cn(
                    'flex size-4 shrink-0 items-center justify-center rounded border transition-colors',
                    isChecked
                      ? 'border-primary bg-primary text-primary-foreground'
                      : 'border-muted-foreground/40 bg-background',
                  )}
                >
                  {isChecked && <IconCheck className="size-3 stroke-[2.5]" />}
                </span>
                <span className="text-foreground truncate text-xs sm:text-sm">
                  {addon.title}
                </span>
              </div>
              <span className="text-muted-foreground shrink-0 text-xs font-medium">
                +{formatCurrency(addon.price)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

