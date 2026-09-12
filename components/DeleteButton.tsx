'use client'

import React from 'react'

import { useTranslations } from 'next-intl'

import { useStoreData } from '@/stores/sites/use-store-data'
import { IconTrash } from '@tabler/icons-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface DeleteButtonProps {
  isPending: boolean
  onDelete: () => void
  icon?: React.ReactNode
  title?: string
  description?: string
  cancelText?: string
  confirmText?: string
  deletingText?: string
  children?: React.ReactNode
}

export function DeleteButton({
  isPending,
  onDelete,
  icon = <IconTrash />,
  title,
  description,
  cancelText,
  confirmText,
  deletingText,
  children,
}: DeleteButtonProps) {
  const t = useTranslations('common')
  const { store } = useStoreData()

  const dialogTitle = title ?? t('deleteModal.title')
  const dialogDescription = description ?? t('deleteModal.description')
  const cancelLabel = cancelText ?? t('actions.cancel')
  const confirmLabel = confirmText ?? t('actions.confirm')
  const deletingLabel = deletingText ?? t('actions.deleting')

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button
            variant="outline"
            size="icon-lg"
            disabled={isPending}
            aria-label={t('actions.delete')}
          >
            {icon}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent
        style={{ '--primary': store?.primaryColor } as React.CSSProperties}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
          <AlertDialogDescription>{dialogDescription}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={onDelete}
            disabled={isPending}
          >
            {isPending ? deletingLabel : confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
