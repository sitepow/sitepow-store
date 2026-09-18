'use client'

import { useTranslations } from 'next-intl'

import { POSProductItem } from '@/actions/pos/product'

import { cn } from '@/lib/utils'

interface PosOptionChoicesSelectorProps {
  options?: POSProductItem['options']
  selectedOptions: Record<string, string>
  onOptionChange: (groupTitle: string, choiceName: string) => void
  formatCurrency: (val: number) => string
}

export function PosOptionChoicesSelector({
  options,
  selectedOptions,
  onOptionChange,
  formatCurrency,
}: PosOptionChoicesSelectorProps) {
  const t = useTranslations('merchant.pos')

  if (!options || options.length === 0) {
    return null
  }

  return (
    <>
      {options.map((option, idx) => (
        <div key={option.id || idx} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground text-xs font-semibold tracking-wider uppercase">
                {option.title}
              </span>
              {option.require && (
                <span className="text-destructive text-[11px] font-medium">
                  {t('required')}
                </span>
              )}
            </div>
            {selectedOptions[option.title] && (
              <span className="text-muted-foreground text-xs">
                {selectedOptions[option.title]}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {option.choices.map((choice) => {
              const isChecked = selectedOptions[option.title] === choice.name
              return (
                <button
                  key={choice.id || choice.name}
                  type="button"
                  onClick={() => onOptionChange(option.title, choice.name)}
                  className={cn(
                    'relative flex items-center justify-between gap-2 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors',
                    isChecked
                      ? 'border-primary bg-primary text-primary-foreground font-semibold shadow-2xs'
                      : 'border-border/70 bg-card hover:border-border hover:bg-muted/40 text-foreground',
                  )}
                >
                  <span>{choice.name}</span>
                  {choice.extraPrice > 0 && (
                    <span
                      className={cn(
                        'text-[11px]',
                        isChecked
                          ? 'text-primary-foreground/80'
                          : 'text-muted-foreground',
                      )}
                    >
                      +{formatCurrency(choice.extraPrice)}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </>
  )
}

