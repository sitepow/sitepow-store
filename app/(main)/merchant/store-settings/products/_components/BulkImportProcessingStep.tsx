'use client'

import { useTranslations } from 'next-intl'

import { Progress } from '@/components/ui/progress'
import { IconClock } from '@tabler/icons-react'

interface BulkImportProcessingStepProps {
  importProgress: number
}

export function BulkImportProcessingStep({
  importProgress,
}: BulkImportProcessingStepProps) {
  const t = useTranslations('merchant.products.bulkImport')

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-12 text-center">
      <div className="border-primary/20 bg-primary/10 animate-pulse rounded-full border p-4">
        <IconClock className="text-primary h-8 w-8" />
      </div>
      <div className="space-y-1">
        <h3 className="text-base font-semibold">
          {t('processingTitle')}
        </h3>
        <p className="text-muted-foreground text-xs">
          {t('processingDesc')}
        </p>
      </div>
      <div className="w-full max-w-xs space-y-2">
        <Progress value={importProgress} className="h-2" />
        <span className="text-muted-foreground text-xs">
          {importProgress}%
        </span>
      </div>
    </div>
  )
}

