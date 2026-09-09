'use client'

import React from 'react'

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
  children?: React.ReactNode
}

export function DeleteButton({
  isPending,
  onDelete,
  icon = <IconTrash />,
  title = 'ยืนยันการลบข้อมูล?',
  description = 'การดำเนินการนี้ไม่สามารถย้อนกลับได้ ข้อมูลของคุณจะถูกลบออกจากระบบอย่างถาวร',
  children,
}: DeleteButtonProps) {
  const { store } = useStoreData()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children ?? (
          <Button variant="outline" size="icon-lg" disabled={isPending}>
            {icon}
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent
        style={{ '--primary': store?.primaryColor } as React.CSSProperties}
      >
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>ยกเลิก</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={onDelete} disabled={isPending}>
            {isPending ? 'กำลังลบ...' : 'ยืนยัน'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
