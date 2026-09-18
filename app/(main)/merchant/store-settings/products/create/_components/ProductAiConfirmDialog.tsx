'use client'

import { useTranslations } from 'next-intl'

import { AiGenTask } from '@/types/ai'

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

interface ProductAiConfirmDialogProps {
  aiTaskConfirm: {
    task: AiGenTask
    cost: number
    action: () => void
  } | null
  onClose: () => void
  primaryColor?: string | null
}

export function ProductAiConfirmDialog({
  aiTaskConfirm,
  onClose,
  primaryColor,
}: ProductAiConfirmDialogProps) {
  const t = useTranslations('merchant.products.form')

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
            {t.rich('aiConfirmDesc', {
              cost: aiTaskConfirm?.cost ?? 0,
              highlight: (chunks) => (
                <span className="text-primary">{chunks}</span>
              ),
            })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (aiTaskConfirm) {
                aiTaskConfirm.action()
                onClose()
              }
            }}
          >
            {t('aiConfirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
