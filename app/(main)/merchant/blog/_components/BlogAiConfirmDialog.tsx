'use client'

import { useTranslations } from 'next-intl'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { AiGenTask } from '@/types/ai'

interface BlogAiConfirmDialogProps {
  aiTaskConfirm: {
    task: AiGenTask
    cost: number
    action: () => void
  } | null
  primaryColor?: string | null
  onClose: () => void
}

export function BlogAiConfirmDialog({
  aiTaskConfirm,
  primaryColor,
  onClose,
}: BlogAiConfirmDialogProps) {
  const t = useTranslations('merchant.blog.form')
  const tCommon = useTranslations('common.actions')

  return (
    <AlertDialog open={!!aiTaskConfirm} onOpenChange={onClose}>
      <AlertDialogContent
        style={
          {
            '--primary': primaryColor,
          } as React.CSSProperties
        }
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{t('aiConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t.rich('aiConfirmDescription', {
              cost: aiTaskConfirm?.cost || 0,
              b: (chunks) => (
                <span className="text-primary font-bold">{chunks}</span>
              ),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{tCommon('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (aiTaskConfirm) {
                aiTaskConfirm.action()
                onClose()
              }
            }}
          >
            {tCommon('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
