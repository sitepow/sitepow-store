'use client'

import { useTranslations } from 'next-intl'
import {
  IconArrowLeft,
  IconCheck,
  IconLoader2,
  IconSparkles,
  IconTrash,
} from '@tabler/icons-react'

import { Button } from '@/components/ui/button'
import { DialogFooter } from '@/components/ui/dialog'

interface AiAffiliateDialogFooterProps {
  step: 'input' | 'preview'
  hasDraft: boolean
  isGenerating: boolean
  isSaving: boolean
  productUrl: string
  title: string
  onClose: () => void
  onClearDraft: () => void
  onGenerate: () => void
  onBackToInput: () => void
  onSaveProduct: () => void
}

export function AiAffiliateDialogFooter({
  step,
  hasDraft,
  isGenerating,
  isSaving,
  productUrl,
  title,
  onClose,
  onClearDraft,
  onGenerate,
  onBackToInput,
  onSaveProduct,
}: AiAffiliateDialogFooterProps) {
  const t = useTranslations('merchant.products.aiAffiliateDialog')

  return (
    <DialogFooter className="bg-muted/10 border-t p-3 sm:p-6">
      {step === 'input' ? (
        <div className="flex w-full flex-col-reverse items-stretch justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={isGenerating}
              onClick={onClose}
              className="w-full text-xs sm:w-auto sm:text-sm"
            >
              {t('btnBack')}
            </Button>
            {hasDraft && (
              <Button
                variant="ghost"
                type="button"
                disabled={isGenerating}
                onClick={onClearDraft}
                className="text-muted-foreground hover:text-destructive w-full gap-1 text-xs sm:w-auto sm:text-sm"
              >
                <IconTrash className="h-3.5 w-3.5" />
                ล้างแบบร่าง
              </Button>
            )}
          </div>
          <Button
            disabled={!productUrl.trim() || isGenerating}
            onClick={onGenerate}
            className="w-full gap-2 text-xs sm:w-auto sm:text-sm"
          >
            {isGenerating ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                <span>{t('generating')}</span>
              </>
            ) : (
              <>
                <IconSparkles className="h-4 w-4" />
                <span>{t('generateBtn')}</span>
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="flex w-full flex-col-reverse items-stretch justify-between gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={isSaving}
              onClick={onBackToInput}
              className="w-full gap-1.5 text-xs sm:w-auto sm:text-sm"
            >
              <IconArrowLeft className="h-4 w-4" />
              {t('btnBack')}
            </Button>
            <Button
              variant="ghost"
              type="button"
              disabled={isSaving}
              onClick={onClearDraft}
              className="text-muted-foreground hover:text-destructive gap-1 text-xs sm:text-sm"
            >
              <IconTrash className="h-3.5 w-3.5" />
              ล้างแบบร่าง
            </Button>
          </div>
          <Button
            disabled={isSaving || !title.trim()}
            onClick={onSaveProduct}
            className="w-full gap-2 text-xs sm:w-auto sm:text-sm"
          >
            {isSaving ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" />
                <span>{t('btnSaving')}</span>
              </>
            ) : (
              <>
                <IconCheck className="h-4 w-4" />
                <span>{t('btnSave')}</span>
              </>
            )}
          </Button>
        </div>
      )}
    </DialogFooter>
  )
}
