'use client'

import { useTranslations } from 'next-intl'

interface AiAffiliateStepIndicatorProps {
  step: 'input' | 'preview'
  title: string
  hasDraft: boolean
}

export function AiAffiliateStepIndicator({
  step,
  title,
  hasDraft,
}: AiAffiliateStepIndicatorProps) {
  const t = useTranslations('merchant.products.aiAffiliateDialog')

  return (
    <>
      {/* Desktop Step Indicator */}
      <div className="hidden items-center justify-between pr-8 text-xs font-medium sm:flex">
        <div className="flex items-center gap-2">
          <span
            className={`rounded-full border px-2.5 py-1 transition-colors ${
              step === 'input'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground'
            }`}
          >
            {t('step1')}
          </span>
          <span className="text-muted-foreground">→</span>
          <span
            className={`rounded-full border px-2.5 py-1 transition-colors ${
              step === 'preview'
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-background text-muted-foreground'
            }`}
          >
            {t('step2', {
              title: title ? title.slice(0, 16) + '...' : 'Preview',
            })}
          </span>
        </div>
        {hasDraft && (
          <span className="text-muted-foreground flex items-center gap-1.5 text-[11px]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            บันทึกแบบร่างอัตโนมัติ
          </span>
        )}
      </div>

      {/* Mobile Step Indicator */}
      <div className="flex flex-col gap-1 sm:hidden">
        <div className="flex w-full items-center justify-between gap-1.5 pt-0.5 text-[11px] font-medium">
          <span
            className={`flex-1 rounded-full border py-1 text-center transition-colors ${
              step === 'input'
                ? 'border-primary bg-primary/10 text-primary font-semibold'
                : 'border-border bg-background text-muted-foreground'
            }`}
          >
            1. {t('step1')}
          </span>
          <span className="text-muted-foreground">→</span>
          <span
            className={`flex-1 rounded-full border py-1 text-center transition-colors ${
              step === 'preview'
                ? 'border-primary bg-primary/10 text-primary font-semibold'
                : 'border-border bg-background text-muted-foreground'
            }`}
          >
            2.{' '}
            {t('step2', {
              title: title ? title.slice(0, 12) + '...' : 'Preview',
            })}
          </span>
        </div>
        {hasDraft && (
          <div className="text-muted-foreground flex items-center justify-end gap-1 text-[10px]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            บันทึกแบบร่างอัตโนมัติ
          </div>
        )}
      </div>
    </>
  )
}
