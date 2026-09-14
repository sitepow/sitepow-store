'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { useCurrentStore } from '@/hooks/use-current-store'

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

export interface AiCreditConfirmData {
  cost: number
  action: () => void
}

export interface AiCreditConfirmDialogProps {
  confirmData: AiCreditConfirmData | null
  onOpenChange: (open: boolean) => void
  title?: string
  description?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
}

/**
 * Shared confirmation dialog for actions consuming AI credits.
 */
export function AiCreditConfirmDialog({
  confirmData,
  onOpenChange,
  title,
  description,
  confirmLabel,
  cancelLabel,
}: AiCreditConfirmDialogProps) {
  const { currentStore, store } = useCurrentStore()
  const t = useTranslations('merchant.categories.dialog')

  const open = !!confirmData

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent
        style={
          {
            '--primary': currentStore?.primaryColor ?? store?.primaryColor,
          } as React.CSSProperties
        }
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title ?? t('aiConfirmTitle')}</AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              t.rich('aiConfirmDescription', {
                cost: confirmData?.cost ?? 0,
                b: (chunks) => (
                  <span className="text-primary font-bold">{chunks}</span>
                ),
              })}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{cancelLabel ?? t('cancel')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              if (confirmData) {
                confirmData.action()
                onOpenChange(false)
              }
            }}
          >
            {confirmLabel ?? t('confirm')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
